import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard, Wallet, CheckCircle2, ArrowRight,
  Banknote, ShieldCheck, TrendingUp, Sparkles, ChevronRight
} from 'lucide-react'
import toast from 'react-hot-toast'
import { accountApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, maskAccount } from '../utils/helpers'

const ACCOUNT_TYPES = [
  {
    type: 'SAVINGS',
    icon: Wallet,
    title: 'Savings Account',
    description: 'Earn interest on your deposits and build your financial future.',
    minDeposit: 500,
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    iconColor: 'text-blue-600 dark:text-blue-400',
    activeBorder: 'border-blue-500',
    activeRing: 'ring-2 ring-blue-400',
    perks: ['4.5% p.a. interest', 'Zero minimum balance fee', 'Free ATM withdrawals'],
  },
  {
    type: 'CURRENT',
    icon: CreditCard,
    title: 'Current Account',
    description: 'Ideal for businesses and frequent transactions with no limits.',
    minDeposit: 1000,
    gradient: 'from-violet-500 to-purple-600',
    lightBg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-200 dark:border-violet-700',
    iconColor: 'text-violet-600 dark:text-violet-400',
    activeBorder: 'border-violet-500',
    activeRing: 'ring-2 ring-violet-400',
    perks: ['Unlimited transactions', '₹10,000 overdraft facility', 'Priority support'],
  },
]

const QUICK_AMOUNTS = [500, 1000, 5000, 10000, 25000]

export default function CreateAccountPage() {
  const navigate = useNavigate()
  const { user, accounts, refreshAccounts } = useAuth()

  const [selectedType, setSelectedType] = useState(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [errors, setErrors] = useState({})

  const typeConfig = ACCOUNT_TYPES.find(t => t.type === selectedType)

  const validate = () => {
    const e = {}
    if (!selectedType) e.type = 'Please select an account type'
    if (!amount) e.amount = 'Initial deposit is required'
    else {
      const val = parseFloat(amount)
      const min = typeConfig?.minDeposit || 500
      if (isNaN(val) || val < min) e.amount = `Minimum deposit for ${selectedType === 'SAVINGS' ? 'Savings' : 'Current'} is ${formatCurrency(min)}`
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
      const newAccount = await accountApi.create({
        userId: user.id,
        accountType: selectedType,
        initialDeposit: parseFloat(amount),
      })
      setSuccess(newAccount)
      const updated = await accountApi.getByUser(user.id)
      refreshAccounts(updated)
      toast.success(`${typeConfig.title} opened successfully!`)
    } catch (err) {
      toast.error(err.message)
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="card text-center space-y-6 py-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
            className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto"
          >
            <CheckCircle2 size={44} className="text-emerald-500" />
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Opened!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Your new account is ready to use immediately.
            </p>
          </div>

          <div className={`rounded-2xl p-5 bg-gradient-to-br ${typeConfig?.gradient} text-white text-left shadow-lg`}>
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <CreditCard size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">{success.accountType}</span>
            </div>
            <p className="text-xs font-mono opacity-70 mb-1">{maskAccount(success.accountNumber)}</p>
            <p className="text-3xl font-bold">{formatCurrency(success.balance)}</p>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">ACTIVE</span>
              <span className="text-xs opacity-60">· Just now</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button onClick={() => navigate('/')} className="btn-secondary text-sm">
              Dashboard
            </button>
            <button
              onClick={() => navigate(`/transactions?accountId=${success.id}`)}
              className="btn-outline text-sm text-primary-600 dark:text-primary-400"
            >
              View Transactions
            </button>
            <button
              onClick={() => { setSuccess(null); setAmount(''); setSelectedType(null) }}
              className="btn-primary text-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> Open Another
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles size={22} className="text-primary-500" />
          Open New Account
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Choose an account type and make your initial deposit to get started.
        </p>
      </div>

      {accounts.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-3">
            Your Current Accounts
          </p>
          <div className="flex flex-wrap gap-2">
            {accounts.map(acc => (
              <div key={acc.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${acc.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-400'}`} />
                <span className="font-medium text-gray-700 dark:text-gray-300">{acc.accountType}</span>
                <span className="text-gray-400 font-mono">{maskAccount(acc.accountNumber)}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(acc.balance)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full gradient-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</span>
            <h2 className="font-bold text-gray-900 dark:text-white">Choose Account Type</h2>
          </div>
          {errors.type && <p className="text-xs text-red-500 -mt-2">{errors.type}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ACCOUNT_TYPES.map(({ type, icon: Icon, title, description, gradient, lightBg, border, iconColor, activeBorder, activeRing, perks }) => {
              const isSelected = selectedType === type
              return (
                <motion.button
                  key={type}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setSelectedType(type); setErrors(e => ({ ...e, type: undefined })) }}
                  className={`relative text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                    isSelected
                      ? `${activeBorder} ${activeRing} bg-white dark:bg-gray-900`
                      : `border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600`
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"
                    >
                      <CheckCircle2 size={14} className="text-white" />
                    </motion.div>
                  )}

                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${isSelected ? `bg-gradient-to-br ${gradient}` : lightBg}`}>
                    <Icon size={22} className={isSelected ? 'text-white' : iconColor} />
                  </div>

                  <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{description}</p>

                  <ul className="space-y-1.5">
                    {perks.map(perk => (
                      <li key={perk} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <ChevronRight size={12} className={isSelected ? 'text-primary-500' : 'text-gray-400'} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </motion.button>
              )
            })}
          </div>
        </div>

        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="card space-y-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-6 h-6 rounded-full gradient-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</span>
                <h2 className="font-bold text-gray-900 dark:text-white">Initial Deposit</h2>
              </div>

              <div className={`flex items-center gap-3 p-3 rounded-xl text-sm ${typeConfig?.lightBg} border ${typeConfig?.border}`}>
                <ShieldCheck size={18} className={typeConfig?.iconColor} />
                <span className={`${typeConfig?.iconColor} font-medium`}>
                  Minimum opening deposit: <strong>{formatCurrency(typeConfig?.minDeposit)}</strong>
                </span>
              </div>

              <div>
                <label className="label" htmlFor="create-amount">Deposit Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg">₹</span>
                  <input
                    id="create-amount"
                    type="number"
                    min={typeConfig?.minDeposit}
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={e => { setAmount(e.target.value); setErrors(er => ({ ...er, amount: undefined })) }}
                    className={`input pl-9 text-xl font-bold ${errors.amount ? 'input-error' : ''}`}
                  />
                </div>
                {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}

                <div className="flex flex-wrap gap-2 mt-3">
                  {QUICK_AMOUNTS.filter(v => v >= (typeConfig?.minDeposit || 500)).map(v => (
                    <motion.button
                      key={v}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setAmount(String(v)); setErrors(er => ({ ...er, amount: undefined })) }}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 ${
                        amount === String(v)
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600'
                      }`}
                    >
                      ₹{v.toLocaleString()}
                    </motion.button>
                  ))}
                </div>
              </div>

              {amount && parseFloat(amount) >= (typeConfig?.minDeposit || 0) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl p-5 bg-gradient-to-br ${typeConfig?.gradient} text-white shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 opacity-80">
                      {typeConfig && <typeConfig.icon size={16} />}
                      <span className="text-xs font-semibold uppercase tracking-wide">{selectedType} Account Preview</span>
                    </div>
                    <Banknote size={18} className="opacity-60" />
                  </div>
                  <p className="text-xs font-mono opacity-60 mb-1">{user?.name}</p>
                  <p className="text-3xl font-bold">{formatCurrency(parseFloat(amount))}</p>
                  <p className="text-xs opacity-60 mt-2">Opening balance · Active immediately</p>
                </motion.div>
              )}

              {errors.general && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                </div>
              )}

              <motion.button
                type="submit"
                id="create-account-submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <TrendingUp size={18} />
                    Open {typeConfig?.title}
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  )
}
