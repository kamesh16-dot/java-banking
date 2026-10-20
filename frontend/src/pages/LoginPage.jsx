import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, TrendingUp, Shield, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: Shield, text: 'Bank-grade security' },
  { icon: Zap,    text: 'Instant transfers' },
  { icon: TrendingUp, text: 'Smart analytics' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const user = await authApi.login({ email: form.email, password: form.password })
      login(user)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.message)
      setErrors({ general: err.message })
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (email, pwd) => setForm(f => ({ ...f, email, password: pwd }))

  return (
    <div className="min-h-screen flex">
      {/* ─── Left: Form Panel ─── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold text-gradient">NexaBank</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Sign in to your account to continue
          </p>

          {/* Demo credentials hint */}
          <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wide">
              Demo Credentials
            </p>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => fillDemo('demo@bank.com', 'demo123')}
                className="w-full text-left text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 transition-colors"
              >
                <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                  demo@bank.com / demo123
                </span>
                <span className="text-gray-400">← Customer</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@bank.com', 'admin123')}
                className="w-full text-left text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2 transition-colors"
              >
                <span className="font-mono bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                  admin@bank.com / admin123
                </span>
                <span className="text-gray-400">← Admin</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="label" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={`input pl-11 ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className={`input pl-11 pr-11 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={e => setForm(f => ({ ...f, remember: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <button type="button" className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors">
                Forgot password?
              </button>
            </div>

            {errors.general && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
              </div>
            )}

            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 hover:text-primary-600 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* ─── Right: Blue Panel ─── */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="hidden lg:flex flex-1 gradient-blue flex-col items-center justify-center p-12 relative overflow-hidden"
      >
        {/* Background blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 text-white text-center max-w-sm">
          {/* Mock dashboard card */}
          <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6 mb-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm">Total Balance</p>
                <p className="text-3xl font-bold">₹1,32,930.75</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <TrendingUp size={24} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {['Savings', 'Current', 'Credit'].map((acc, i) => (
                <div key={acc} className="bg-white/10 rounded-xl p-3">
                  <p className="text-white/60 text-xs">{acc}</p>
                  <p className="font-bold text-sm mt-1">
                    {['₹84,580', '₹38,350', '₹10,000'][i]}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">↑ Salary Credit</span>
                <span className="font-semibold text-emerald-300">+₹42,000</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span className="text-white/70">↓ Amazon Purchase</span>
                <span className="font-semibold text-rose-300">-₹1,499</span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            Banking made simple,<br />powered by trust.
          </h2>
          <p className="text-white/80 mb-8 leading-relaxed">
            Manage your finances, send money, and track spending — all in one beautiful dashboard.
          </p>

          <div className="flex flex-col gap-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
