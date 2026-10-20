import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeftRight, Search, CheckCircle, AlertCircle, User, LayoutDashboard, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { transactionApi, accountApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, maskAccount } from '../utils/helpers'
import Modal from '../components/common/Modal'
import { useDebouncedCallback } from '../hooks/useDebounce'

export default function TransferPage() {
  const navigate = useNavigate()
  const { accounts, updateAccount, refreshUserAccounts } = useAuth()
  const [form, setForm] = useState({ fromAccountId: accounts[0]?.id || '', toAccountNumber: '', amount: '', description: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [receiver, setReceiver] = useState(null)
  const [lookupError, setLookupError] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [success, setSuccess] = useState(null)

  const fromAccount = accounts.find(a => a.id === Number(form.fromAccountId))

  const lookupAccount = useDebouncedCallback(async (num) => {
    if (!num || num.length < 8) { setReceiver(null); setLookupError(''); return }
    setLookupLoading(true)
    setLookupError('')
    try {
      const acc = await accountApi.lookup(num)
      if (acc.accountNumber === fromAccount?.accountNumber) {
        setReceiver(null)
        setLookupError('Cannot transfer to the same account')
      } else {
        setReceiver(acc)
      }
    } catch {
      setReceiver(null)
      setLookupError('Account not found')
    } finally {
      setLookupLoading(false)
    }
  }, 500)

  const validate = () => {
    const e = {}
    if (!form.fromAccountId) e.fromAccountId = 'Select source account'
    if (!form.toAccountNumber) e.toAccountNumber = 'Destination account number required'
    else if (!receiver) e.toAccountNumber = lookupError || 'Invalid destination account'
    if (!form.amount) e.amount = 'Amount is required'
    else if (parseFloat(form.amount) < 1) e.amount = 'Minimum ₹1'
    else if (fromAccount) {
      const avail = parseFloat(fromAccount.balance) - parseFloat(fromAccount.minimumBalance)
      if (parseFloat(form.amount) > avail) e.amount = `Insufficient funds. Max: ${formatCurrency(avail)}`
    }
    return e
  }

  const handlePreview = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setConfirmOpen(true)
  }

  const handleConfirm = async () => {
    setConfirmOpen(false)
    setLoading(true)
    try {
      const tx = await transactionApi.transfer({
        accountId: Number(form.fromAccountId),
        toAccountNumber: form.toAccountNumber,
        amount: parseFloat(form.amount),
        description: form.description || `Transfer to ${form.toAccountNumber}`,
      })
      setSuccess({ ...tx, accountId: Number(form.fromAccountId) })
      updateAccount({ ...fromAccount, balance: tx.balanceAfter })
      await refreshUserAccounts()
      toast.success(`Transfer of ${formatCurrency(tx.amount)} completed!`)
      setForm(f => ({ ...f, toAccountNumber: '', amount: '', description: '' }))
      setReceiver(null)
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transfer Money</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Send money to any NexaBank account</p>
      </div>

      {success && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle size={32} className="text-emerald-500 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-800 dark:text-emerald-300">Transfer Successful!</p>
              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                {formatCurrency(success.amount)} sent. New balance: {formatCurrency(success.balanceAfter)}
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
              Transfer Again
            </button>
          </div>
        </motion.div>
      )}

      <form onSubmit={handlePreview} className="card space-y-5">
        {/* From Account */}
        <div>
          <label className="label" htmlFor="from-acc">From Account</label>
          <select id="from-acc" value={form.fromAccountId}
            onChange={e => setForm(f => ({ ...f, fromAccountId: e.target.value }))}
            className={`input ${errors.fromAccountId ? 'input-error' : ''}`}>
            <option value="">— Select account —</option>
            {accounts.filter(a => a.status === 'ACTIVE').map(a => (
              <option key={a.id} value={a.id}>
                {a.accountType} · {maskAccount(a.accountNumber)} · {formatCurrency(a.balance)}
              </option>
            ))}
          </select>
          {errors.fromAccountId && <p className="text-xs text-red-500 mt-1">{errors.fromAccountId}</p>}
        </div>

        {/* Arrow Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <div className="p-2.5 rounded-full bg-primary-100 dark:bg-primary-900/30">
            <ArrowLeftRight size={18} className="text-primary-500" />
          </div>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* To Account Number */}
        <div>
          <label className="label" htmlFor="to-acc">To Account Number</label>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input id="to-acc" type="text" placeholder="e.g. 100000000004"
              value={form.toAccountNumber}
              onChange={e => {
                setForm(f => ({ ...f, toAccountNumber: e.target.value }))
                lookupAccount(e.target.value)
                setReceiver(null)
              }}
              className={`input pl-11 ${errors.toAccountNumber ? 'input-error' : ''}`} />
            {lookupLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          {errors.toAccountNumber && <p className="text-xs text-red-500 mt-1">{errors.toAccountNumber}</p>}
          {lookupError && !errors.toAccountNumber && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <AlertCircle size={13} className="text-red-500" />
              <p className="text-xs text-red-500">{lookupError}</p>
            </div>
          )}
          <AnimatePresence>
            {receiver && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold">
                  {receiver.ownerName?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{receiver.ownerName}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">{receiver.accountType} Account</p>
                </div>
                <CheckCircle size={18} className="text-emerald-500 ml-auto" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Amount */}
        <div>
          <label className="label" htmlFor="tr-amount">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
            <input id="tr-amount" type="number" min="1" step="0.01" placeholder="0.00"
              value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className={`input pl-8 text-lg font-bold ${errors.amount ? 'input-error' : ''}`} />
          </div>
          {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label" htmlFor="tr-desc">Description (optional)</label>
          <input id="tr-desc" type="text" placeholder="e.g. Rent payment"
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="input" />
        </div>

        {errors.general && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
          </div>
        )}

        <button type="submit" id="transfer-preview" disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2">
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><ArrowLeftRight size={18} /> Review Transfer</>
          }
        </button>
      </form>

      {/* Confirm Modal */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Transfer">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">From</span>
              <span className="font-semibold">{fromAccount?.accountType} · {maskAccount(fromAccount?.accountNumber)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">To</span>
              <span className="font-semibold">{receiver?.ownerName} ({maskAccount(form.toAccountNumber)})</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Amount</span>
              <span className="font-bold text-lg text-primary-500">{formatCurrency(parseFloat(form.amount) || 0)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">This action cannot be undone</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleConfirm} id="confirm-transfer" className="btn-primary flex-1">Confirm Transfer</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
