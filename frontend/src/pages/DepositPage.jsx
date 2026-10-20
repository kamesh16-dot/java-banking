import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlusCircle, CheckCircle, ArrowRight, LayoutDashboard, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, maskAccount } from '../utils/helpers'

const categories = ['Income', 'Salary', 'Investment', 'Gift', 'Refund', 'Other']

export default function DepositPage() {
  const navigate = useNavigate()
  const { accounts, updateAccount, refreshUserAccounts } = useAuth()
  const [form, setForm] = useState({ accountId: accounts[0]?.id || '', amount: '', description: '', category: 'Income' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const selectedAccount = accounts.find(a => a.id === Number(form.accountId))

  const validate = () => {
    const e = {}
    if (!form.accountId) e.accountId = 'Please select an account'
    if (!form.amount) e.amount = 'Amount is required'
    else if (parseFloat(form.amount) < 1) e.amount = 'Minimum deposit is ₹1'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const tx = await transactionApi.deposit({
        accountId: Number(form.accountId),
        amount: parseFloat(form.amount),
        description: form.description || 'Deposit',
        category: form.category,
      })
      setSuccess({ ...tx, accountId: Number(form.accountId) })
      updateAccount({ ...selectedAccount, balance: tx.balanceAfter })
      await refreshUserAccounts()
      toast.success(`Successfully deposited ${formatCurrency(tx.amount)}!`)
      setForm(f => ({ ...f, amount: '', description: '' }))
    } catch (err) {
      toast.error(err.message)
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deposit Funds</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Add money to your account</p>
      </div>

      {success && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 space-y-3"
        >
          <div className="flex items-center gap-3">
            <CheckCircle size={32} className="text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-300">Deposit Successful!</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {formatCurrency(success.amount)} deposited. New balance: {formatCurrency(success.balanceAfter)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/60">
            <button
              onClick={() => navigate(`/transactions?accountId=${success.accountId}`)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
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
              Deposit Again
            </button>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Account Select */}
        <div>
          <label className="label" htmlFor="dep-account">Select Account</label>
          <select
            id="dep-account"
            value={form.accountId}
            onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
            className={`input ${errors.accountId ? 'input-error' : ''}`}
          >
            <option value="">— Choose account —</option>
            {accounts.filter(a => a.status === 'ACTIVE').map(a => (
              <option key={a.id} value={a.id}>
                {a.accountType} · {maskAccount(a.accountNumber)} · {formatCurrency(a.balance)}
              </option>
            ))}
          </select>
          {errors.accountId && <p className="text-xs text-red-500 mt-1">{errors.accountId}</p>}
        </div>

        {/* Current balance */}
        {selectedAccount && (
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex justify-between text-sm">
            <span className="text-blue-700 dark:text-blue-400 font-medium">Current Balance</span>
            <span className="font-bold text-blue-800 dark:text-blue-300">{formatCurrency(selectedAccount.balance)}</span>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="label" htmlFor="dep-amount">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
            <input
              id="dep-amount"
              type="number" min="1" step="0.01" placeholder="0.00"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className={`input pl-8 text-lg font-bold ${errors.amount ? 'input-error' : ''}`}
            />
          </div>
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          {/* Quick amounts */}
          <div className="flex gap-2 mt-2">
            {[500, 1000, 5000, 10000].map(v => (
              <button key={v} type="button" onClick={() => setForm(f => ({ ...f, amount: String(v) }))}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 transition-colors font-medium">
                ₹{v.toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label" htmlFor="dep-category">Category</label>
          <select id="dep-category" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="label" htmlFor="dep-note">Note (optional)</label>
          <input id="dep-note" type="text" placeholder="e.g. Monthly salary" value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input" />
        </div>

        {errors.general && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
          </div>
        )}

        <button type="submit" id="deposit-submit" disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2">
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><PlusCircle size={18} /> Deposit Funds</>
          }
        </button>
      </form>
    </div>
  )
}
