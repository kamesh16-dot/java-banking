import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PlusCircle, MinusCircle, ArrowLeftRight, FileText,
  Wallet, TrendingUp, CreditCard, ArrowDownLeft, ArrowUpRight, PlusSquare
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { transactionApi, accountApi } from '../api'
import { formatCurrency, formatDate, getTxColor, getTxPrefix, getTxLabel, categoryColor, maskAccount } from '../utils/helpers'
import TransactionRow from '../components/common/TransactionRow'
import StatsCard from '../components/common/StatsCard'
import { SkeletonCard, SkeletonList } from '../components/common/Skeleton'

const quickActions = [
  { label: 'Deposit',     icon: PlusCircle,      to: '/deposit',         color: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
  { label: 'Withdraw',    icon: MinusCircle,      to: '/withdraw',        color: 'bg-amber-500',   hover: 'hover:bg-amber-600' },
  { label: 'Transfer',    icon: ArrowLeftRight,   to: '/transfer',        color: 'bg-primary-500', hover: 'hover:bg-primary-600' },
  { label: 'Statement',   icon: FileText,         to: '/transactions',    color: 'bg-purple-500',  hover: 'hover:bg-purple-600' },
  { label: 'New Account', icon: PlusSquare,       to: '/create-account',  color: 'bg-rose-500',    hover: 'hover:bg-rose-600' },
]

// Build last-30-days balance line data from transactions
function buildChartData(transactions) {
  const days = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  // Use balanceAfter of the last tx on or before each day
  return days.map(day => {
    const txsOnDay = transactions.filter(t => t.createdAt?.slice(0, 10) <= day)
    const lastTx = txsOnDay[0]
    return { date: formatDate(day), balance: lastTx ? parseFloat(lastTx.balanceAfter) : 0 }
  })
}

// Build spending-by-category data
function buildPieData(transactions) {
  const map = {}
  transactions
    .filter(t => t.type === 'WITHDRAWAL' || t.type === 'TRANSFER_OUT')
    .forEach(t => {
      const cat = t.category || 'Other'
      map[cat] = (map[cat] || 0) + parseFloat(t.amount)
    })
  return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) }))
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, accounts, updateAccount, refreshUserAccounts } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!accounts.length) { setLoading(false); return }
    setLoading(true)
    try {
      const primaryId = accounts[0].id
      const txs = await transactionApi.getAll(primaryId)
      setTransactions(txs)

      // Refresh account balances across app
      await refreshUserAccounts()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [accounts, user?.id])

  useEffect(() => { loadData() }, [])

  const totalBalance = accounts.reduce((s, a) => s + parseFloat(a.balance || 0), 0)
  const totalCredit  = accounts.reduce((s, a) => s + parseFloat(a.availableCredit || 0), 0)
  const recentTxs    = transactions.slice(0, 5)
  const chartData    = buildChartData(transactions)
  const pieData      = buildPieData(transactions)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Good day, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Here's what's happening with your finances today.
        </p>
      </div>

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Balance" value={formatCurrency(totalBalance)} sub="Across all accounts" icon={Wallet} color="blue" delay={0} />
          <StatsCard title="Available Credit" value={formatCurrency(totalCredit)} sub="Credit line available" icon={CreditCard} color="purple" delay={0.1} />
          <StatsCard title="Total Income" value={formatCurrency(
            transactions.filter(t => t.type === 'DEPOSIT' || t.type === 'TRANSFER_IN').reduce((s, t) => s + parseFloat(t.amount), 0)
          )} sub="All time deposits" icon={ArrowDownLeft} color="emerald" delay={0.2} trend={8} />
          <StatsCard title="Total Expenses" value={formatCurrency(
            transactions.filter(t => t.type === 'WITHDRAWAL' || t.type === 'TRANSFER_OUT').reduce((s, t) => s + parseFloat(t.amount), 0)
          )} sub="All time withdrawals" icon={ArrowUpRight} color="rose" delay={0.3} trend={-3} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map(({ label, icon: Icon, to, color, hover }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(to)}
              className={`${color} ${hover} text-white rounded-2xl py-5 flex flex-col items-center gap-2.5 shadow-lg transition-colors duration-200`}
            >
              <Icon size={24} />
              <span className="text-sm font-semibold">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Accounts */}
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">My Accounts</h2>
            <button onClick={() => navigate('/transactions')} className="text-xs text-primary-500 font-semibold cursor-pointer hover:underline">View All</button>
          </div>
          {loading ? <SkeletonList rows={3} /> : (
            <div className="space-y-3">
              {accounts.map((acc, i) => (
                <motion.div
                  key={acc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/transactions?accountId=${acc.id}`)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    acc.accountType === 'SAVINGS'
                      ? 'gradient-blue text-white'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750'
                  }`}
                  title="Click to view transactions for this account"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex items-center gap-2 ${acc.accountType !== 'SAVINGS' ? 'text-gray-700 dark:text-gray-300' : 'text-white'}`}>
                      <CreditCard size={16} />
                      <span className="text-xs font-semibold uppercase tracking-wide">{acc.accountType}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      acc.status === 'ACTIVE'
                        ? acc.accountType === 'SAVINGS' ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700'
                    } font-medium`}>{acc.status}</span>
                  </div>
                  <p className={`text-xs font-mono ${acc.accountType !== 'SAVINGS' ? 'text-gray-500 dark:text-gray-400' : 'text-white/80'}`}>
                    {maskAccount(acc.accountNumber)}
                  </p>
                  <p className={`text-xl font-bold mt-1 ${acc.accountType !== 'SAVINGS' ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                    {formatCurrency(acc.balance)}
                  </p>
                  <p className={`text-[10px] mt-2 opacity-60 flex items-center gap-1 ${acc.accountType === 'SAVINGS' ? 'text-white' : 'text-gray-500'}`}>
                    Click to view transactions →
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Balance Chart */}
        <div className="card lg:col-span-2">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Balance Trend (30 days)</h2>
          {loading ? <div className="h-48 skeleton rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#1E88E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={6} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="balance" stroke="#1E88E5" strokeWidth={2.5} fill="url(#colorBal)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Transactions + Spending Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
            <button onClick={() => navigate('/transactions')} className="text-xs text-primary-500 font-semibold hover:underline">
              View All
            </button>
          </div>
          {loading ? <SkeletonList rows={5} /> : recentTxs.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-600">
              <FileText size={40} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div>
              {recentTxs.map((tx, i) => (
                <TransactionRow key={tx.id} tx={tx} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Spending by Category */}
        <div className="card">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-4">Spending by Category</h2>
          {loading ? <div className="h-48 skeleton rounded-xl" /> : pieData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No spending data</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={categoryColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.slice(0, 5).map(({ name, value }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: categoryColor(name) }} />
                      <span className="text-gray-600 dark:text-gray-400">{name}</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
