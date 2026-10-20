import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, IndianRupee, Activity, Search, Lock, Unlock,
  ChevronRight, X, CheckCircle, XCircle, ArrowDownLeft, ArrowUpRight
} from 'lucide-react'
import { adminApi } from '../../api'
import { formatCurrency, formatDate, formatDateTime, maskAccount, getInitials, getAvatarColor, getTxColor, getTxPrefix, getTxLabel } from '../../utils/helpers'
import { SkeletonCard, SkeletonTable } from '../../components/common/Skeleton'
import StatsCard from '../../components/common/StatsCard'
import toast from 'react-hot-toast'

function CustomerDrawer({ customer, onClose, onToggle }) {
  if (!customer) return null

  const totalBalance = customer.accounts?.reduce((s, a) => s + parseFloat(a.balance || 0), 0) || 0

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl h-full overflow-y-auto scrollbar-thin">

          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between z-10">
            <h2 className="font-bold text-gray-900 dark:text-white">Customer Details</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${getAvatarColor(customer.name)} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                {getInitials(customer.name)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{customer.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">Joined {formatDate(customer.createdAt)}</p>
              </div>
            </div>

            {/* Total Balance */}
            <div className="p-4 rounded-2xl gradient-blue text-white">
              <p className="text-sm text-white/80">Total Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
            </div>

            {/* Accounts */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Accounts</h4>
              <div className="space-y-3">
                {customer.accounts?.map(acc => (
                  <div key={acc.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">{acc.accountType}</span>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{maskAccount(acc.accountNumber)}</p>
                      </div>
                      <span className={`badge ${acc.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {acc.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(acc.balance)}</p>
                      <button
                        onClick={() => onToggle(acc)}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                          acc.status === 'ACTIVE'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200'
                            : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200'
                        }`}
                      >
                        {acc.status === 'ACTIVE' ? <><Lock size={12} /> Freeze</> : <><Unlock size={12} /> Unfreeze</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Contact</h4>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Phone</span>
                  <span className="font-medium text-gray-900 dark:text-white">{customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Status</span>
                  <span className={`font-semibold ${customer.active ? 'text-emerald-600' : 'text-red-500'}`}>
                    {customer.active ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [selected, setSelected] = useState(null)

  const loadStats = async () => {
    setLoadingStats(true)
    try {
      const s = await adminApi.getStats()
      setStats(s)
    } catch (err) { console.error(err) }
    finally { setLoadingStats(false) }
  }

  const loadCustomers = async (q = '') => {
    setLoadingCustomers(true)
    try {
      const list = await adminApi.getCustomers(q || undefined)
      setCustomers(list)
    } catch (err) { console.error(err) }
    finally { setLoadingCustomers(false) }
  }

  useEffect(() => { loadStats(); loadCustomers() }, [])

  const handleSearch = (e) => {
    setSearch(e.target.value)
    if (e.target.value === '') loadCustomers()
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadCustomers(search)
  }

  const handleToggle = async (acc) => {
    try {
      const updated = await adminApi.toggleAccountStatus(acc.id)
      toast.success(`Account ${updated.status === 'ACTIVE' ? 'unfrozen' : 'frozen'} successfully`)
      // Update selected customer's accounts
      setSelected(prev => ({
        ...prev,
        accounts: prev.accounts.map(a => a.id === updated.id ? updated : a)
      }))
      setCustomers(prev => prev.map(c => ({
        ...c,
        accounts: c.accounts?.map(a => a.id === updated.id ? updated : a)
      })))
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage customers, accounts, and monitor transactions</p>
      </div>

      {/* Stats Cards */}
      {loadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard title="Total Customers" value={stats?.totalCustomers ?? 0} sub="Registered users" icon={Users} color="blue" delay={0} />
          <StatsCard title="Total Deposits" value={formatCurrency(stats?.totalDeposits ?? 0)} sub="Combined balance" icon={IndianRupee} color="emerald" delay={0.1} />
          <StatsCard title="Transactions Today" value={stats?.todayTransactions ?? 0} sub="Since midnight" icon={Activity} color="purple" delay={0.2} />
        </div>
      )}

      {/* Main Grid: Customers + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Table */}
        <div className="card lg:col-span-2 overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
            <h2 className="font-bold text-gray-900 dark:text-white">Customers</h2>
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search customers..." value={search}
                onChange={handleSearch}
                className="input text-sm py-2 pl-9 pr-3 w-full" />
            </form>
          </div>

          {loadingCustomers ? (
            <div className="p-6"><SkeletonTable rows={5} cols={4} /></div>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Users size={36} className="mx-auto mb-2 opacity-50" />
              <p>No customers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Accounts</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Balance</th>
                    <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, i) => {
                    const totalBal = c.accounts?.reduce((s, a) => s + parseFloat(a.balance || 0), 0) || 0
                    const hasActive = c.accounts?.some(a => a.status === 'ACTIVE')
                    return (
                      <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                        onClick={() => setSelected(c)}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full ${getAvatarColor(c.name)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                              {getInitials(c.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{c.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {c.accounts?.length || 0} account{c.accounts?.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">
                          {formatCurrency(totalBal)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`badge ${hasActive ? 'badge-success' : 'badge-danger'}`}>
                            {hasActive ? 'Active' : 'All Frozen'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <ChevronRight size={16} className="text-gray-400 ml-auto" />
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Transactions Feed */}
        <div className="card lg:col-span-1 overflow-hidden">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          {loadingStats ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex gap-2 animate-pulse">
                  <div className="w-8 h-8 skeleton rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 skeleton rounded w-3/4" />
                    <div className="h-2.5 skeleton rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-1">
              {stats?.recentTransactions?.map((tx, i) => {
                const credit = tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN'
                return (
                  <motion.div key={tx.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      credit ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {credit
                        ? <ArrowDownLeft size={14} className="text-emerald-600" />
                        : <ArrowUpRight size={14} className="text-red-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {tx.description || getTxLabel(tx.type)}
                      </p>
                      <p className="text-[10px] text-gray-400">{maskAccount(tx.accountNumber)}</p>
                    </div>
                    <span className={`text-xs font-bold flex-shrink-0 ${getTxColor(tx.type)}`}>
                      {getTxPrefix(tx.type)}{formatCurrency(tx.amount)}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Customer Drawer */}
      {selected && (
        <CustomerDrawer
          customer={selected}
          onClose={() => setSelected(null)}
          onToggle={handleToggle}
        />
      )}
    </div>
  )
}
