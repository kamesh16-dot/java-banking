import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Mail, Phone, Lock, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    accountType: 'SAVINGS', initialDeposit: '',
  })
  const [errors, setErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone) e.phone = 'Phone is required'
    else if (!/^[+]?[0-9]{10,15}$/.test(form.phone)) e.phone = 'Invalid phone number'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (!form.initialDeposit) e.initialDeposit = 'Initial deposit required'
    else if (parseFloat(form.initialDeposit) < 500) e.initialDeposit = 'Minimum deposit is ₹500'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const user = await authApi.register({
        ...form,
        initialDeposit: parseFloat(form.initialDeposit),
      })
      login(user)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      toast.error(err.message)
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ id, label, icon: Icon, error, children }) => (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" />}
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-surface dark:bg-gray-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <span className="text-2xl font-bold text-gradient">NexaBank</span>
        </div>

        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Get started with NexaBank in minutes</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name */}
            <Field id="name" label="Full Name" icon={User} error={errors.name}>
              <input id="name" type="text" placeholder="Alice Johnson" value={form.name}
                onChange={set('name')} className={`input pl-11 ${errors.name ? 'input-error' : ''}`} />
            </Field>

            {/* Email */}
            <Field id="reg-email" label="Email Address" icon={Mail} error={errors.email}>
              <input id="reg-email" type="email" placeholder="alice@example.com" value={form.email}
                onChange={set('email')} className={`input pl-11 ${errors.email ? 'input-error' : ''}`} />
            </Field>

            {/* Phone */}
            <Field id="phone" label="Phone Number" icon={Phone} error={errors.phone}>
              <input id="phone" type="tel" placeholder="+1 555 000 0000" value={form.phone}
                onChange={set('phone')} className={`input pl-11 ${errors.phone ? 'input-error' : ''}`} />
            </Field>

            {/* Password */}
            <Field id="reg-password" label="Password" icon={Lock} error={errors.password}>
              <input id="reg-password" type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password}
                onChange={set('password')} className={`input pl-11 pr-11 ${errors.password ? 'input-error' : ''}`} />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 transition-colors">
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </Field>

            {/* Account Type */}
            <div>
              <label className="label">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                {['SAVINGS', 'CURRENT'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, accountType: type }))}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                      form.accountType === type
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <Wallet size={16} className="inline mr-2" />
                    {type === 'SAVINGS' ? 'Savings' : 'Current'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {form.accountType === 'SAVINGS' ? 'Min. balance: ₹500' : 'Min. balance: ₹1,000'}
              </p>
            </div>

            {/* Initial Deposit */}
            <Field id="deposit" label="Initial Deposit" error={errors.initialDeposit}>
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium z-10">₹</span>
              <input id="deposit" type="number" min="500" step="0.01" placeholder="500.00"
                value={form.initialDeposit} onChange={set('initialDeposit')}
                className={`input pl-8 ${errors.initialDeposit ? 'input-error' : ''}`} />
            </Field>

            {errors.general && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
              </div>
            )}

            <button type="submit" id="register-submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Create Account'
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
