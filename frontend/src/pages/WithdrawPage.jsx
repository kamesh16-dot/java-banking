import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MinusCircle, AlertTriangle, CheckCircle, LayoutDashboard, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, maskAccount } from '../utils/helpers'

const categories = ['Groceries', 'Shopping', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Rent', 'ATM', 'Other']

export default function WithdrawPage() {
  const navigate = useNavigate()
  const { accounts, updateAccount, refreshUserAccounts } = useAuth()
  const [form, setForm] = useState({ accountId: accounts[0]?.id || '', amount: '', description: '', category: 'Shopping' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const selectedAccount = accounts.find(a => a.id === Number(form.accountId))

  const maxWithdraw = selectedAccount
    ? Math.max(0, parseFloat(selectedAccount.balance) - parseFloat(selectedAccount.minimumBalance))
    : 0

  const validate = () => {
    const e = {}
    if (!form.accountId) e.accountId = 'Please select an account'
    if (!form.amount) e.amount = 'Amount is required'
    else if (parseFloat(form.amount) < 1) e.amount = 'Minimum amount is ₹1'
    else if (selectedAccount && parseFloat(form.amount) > maxWithdraw) {
      e.amount = `Max withdrawable: ${formatCurrency(maxWithdraw)} (minimum balance must be maintained)`
    }
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const tx = await transactionApi.withdraw({
        accountId: Number(form.accountId),
        amount: parseFloat(form.amount),
        description: form.description || 'Withdrawal',
        category: form.category,
      })
      setSuccess({ ...tx, accountId: Number(form.accountId) })
      updateAccount({ ...selectedAccount, balance: tx.balanceAfter })
      await refreshUserAccounts()
      toast.success(`Withdrew ${formatCurrency(tx.amount)} successfully!`)
      setForm(f => ({ ...f, amount: '', description: '' }))
    } catch (err) {
      toast.error(err.message)
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  const amountNum = parseFloat(form.amount) || 0
  const wouldExceed = selectedAccount && amountNum > maxWithdraw && amountNum > 0

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdraw Funds</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Withdraw money from your account</p>
      </div>

      {success && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle size={32} className="text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-300">Withdrawal Successful!</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {formatCurrency(success.amount)} withdrawn. New balance: {formatCurrency(success.balanceAfter)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/60">
            <button
              onClick={() => navigate(`/transactions?accountId=${success.accountId}`)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            >
              <History size={14} /> View in Transactions
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <LayoutDashboard size={14} /> Go to Dashboard
            </button>
            <button
              onClick={() => setSuccess(null)}
              className="text-xs py-1.5 px-3 rounded-xl text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/50 dark:hover:bg-emerald-800/30 font-medium ml-auto transition-colors"
            >
              Withdraw Again
            </button>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Account Select */}
        <div>
          <label className="label" htmlFor="wd-account">Select Account</label>
          <select id="wd-account" value={form.accountId}
            onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
            className={`input ${errors.accountId ? 'input-error' : ''}`}>
            <option value="">— Choose account —</option>
            {accounts.filter(a => a.status === 'ACTIVE').map(a => (
              <option key={a.id} value={a.id}>
                {a.accountType} · {maskAccount(a.accountNumber)} · {formatCurrency(a.balance)}
              </option>
            ))}
          </select>
          {errors.accountId && <p className="text-xs text-red-500 mt-1">{errors.accountId}</p>}
        </div>

        {/* Balance info */}
        {selectedAccount && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">Available Balance</p>
              <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(selectedAccount.balance)}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
              <p className="text-xs text-amber-600 dark:text-amber-400">Max Withdrawable</p>
              <p className="font-bold text-amber-700 dark:text-amber-300">{formatCurrency(maxWithdraw)}</p>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="label" htmlFor="wd-amount">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
            <input id="wd-amount" type="number" min="1" step="0.01" placeholder="0.00"
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className={`input pl-8 text-lg font-bold ${errors.amount || wouldExceed ? 'input-error' : ''}`} />
          </div>
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          {wouldExceed && !errors.amount && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <AlertTriangle size={13} className="text-amber-500" />
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Exceeds withdrawable limit. Max: {formatCurrency(maxWithdraw)}
              </p>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            {[500, 1000, 2000].map(v => (
              <button key={v} type="button" onClick={() => setForm(f => ({ ...f, amount: String(Math.min(v, maxWithdraw)) }))}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-colors font-medium">
                ₹{v.toLocaleString('en-IN')}
              </button>
            ))}
            <button type="button" onClick={() => setForm(f => ({ ...f, amount: String(maxWithdraw.toFixed(2)) }))}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-colors font-medium">
              Max
            </button>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label" htmlFor="wd-category">Category</label>
          <select id="wd-category" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="label" htmlFor="wd-note">Note (optional)</label>
          <input id="wd-note" type="text" placeholder="e.g. ATM withdrawal" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input" />
        </div>

        {errors.general && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
          </div>
        )}

        <button type="submit" id="withdraw-submit" disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600">
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><MinusCircle size={18} /> Withdraw Funds</>
          }
        </button>
      </form>
    </div>
  )
}
