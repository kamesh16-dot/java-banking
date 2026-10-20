import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter, Download, ChevronLeft, ChevronRight, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react'
import { transactionApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatDateTime, getTxColor, getTxPrefix, getTxLabel, maskAccount, exportCSV } from '../utils/helpers'
import { SkeletonTable } from '../components/common/Skeleton'

const TX_TYPES = ['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER_OUT', 'TRANSFER_IN']
const TYPE_ICONS = {
  DEPOSIT:      { Icon: ArrowDownLeft,  color: 'text-emerald-500' },
  WITHDRAWAL:   { Icon: ArrowUpRight,   color: 'text-red-500' },
  TRANSFER_OUT: { Icon: ArrowLeftRight, color: 'text-blue-500' },
  TRANSFER_IN:  { Icon: ArrowLeftRight, color: 'text-indigo-500' },
}

export default function TransactionsPage() {
  const { accounts } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const paramAccountId = searchParams.get('accountId')
  const [accountId, setAccountId] = useState(() => paramAccountId || accounts[0]?.id || '')

  useEffect(() => {
    if (paramAccountId && String(accountId) !== paramAccountId) {
      setAccountId(paramAccountId)
    } else if (!accountId && accounts.length > 0) {
      setAccountId(accounts[0].id)
    }
  }, [paramAccountId, accounts])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 })
  const [loading, setLoading] = useState(false)

  const fetchTxs = useCallback(async () => {
    if (!accountId) return
    setLoading(true)
    try {
      const params = {
        accountId,
        page,
        size: 10,
        ...(typeFilter !== 'ALL' && { type: typeFilter }),
        ...(dateFrom && { from: new Date(dateFrom).toISOString() }),
        ...(dateTo && { to: new Date(dateTo + 'T23:59:59').toISOString() }),
      }
      const result = await transactionApi.getPaged(params)
      setData(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [accountId, page, typeFilter, dateFrom, dateTo])

  useEffect(() => { fetchTxs() }, [fetchTxs])

  const filtered = search
    ? data.content.filter(t =>
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.category?.toLowerCase().includes(search.toLowerCase()) ||
        t.type?.toLowerCase().includes(search.toLowerCase()))
    : data.content

  const handleExport = async () => {
    try {
      const allTxs = await transactionApi.getAll(accountId)
      const rows = allTxs.map(t => ({
        Date: formatDateTime(t.createdAt),
        Type: getTxLabel(t.type),
        Description: t.description,
        Category: t.category,
        Amount: (getTxPrefix(t.type) === '+' ? '' : '-') + t.amount,
        Balance: t.balanceAfter,
        Status: t.status,
      }))
      exportCSV(rows, `transactions-${accountId}.csv`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View and filter your transaction history</p>
        </div>
        <button onClick={handleExport} id="export-csv"
          className="btn-outline flex items-center gap-2 py-2 px-4 text-sm">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        {/* Row 1: Account + Search */}
        <div className="flex flex-wrap gap-3">
          <select value={accountId} onChange={e => { const val = e.target.value; setAccountId(val); setSearchParams({ accountId: val }); setPage(0) }}
            className="input flex-1 min-w-48">
            {accounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.accountType} · {maskAccount(a.accountNumber)}
              </option>
            ))}
          </select>
          <div className="relative flex-1 min-w-48">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search transactions..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-11 w-full" />
          </div>
        </div>

        {/* Row 2: Type + Date Range */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-2 flex-wrap">
            {TX_TYPES.map(type => (
              <button key={type} onClick={() => { setTypeFilter(type); setPage(0) }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  typeFilter === type
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                {type === 'ALL' ? 'All Types' : getTxLabel(type)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(0) }}
              className="input text-sm py-2 px-3" />
            <span className="self-center text-gray-400 text-sm">to</span>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(0) }}
              className="input text-sm py-2 px-3" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <div className="p-6"><SkeletonTable rows={8} cols={5} /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400 dark:text-gray-600">
            <Filter size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No transactions found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Description</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Category</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Type</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Balance</th>
                    <th className="text-center px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx, i) => {
                    const { Icon, color } = TYPE_ICONS[tx.type] || TYPE_ICONS.DEPOSIT
                    return (
                      <motion.tr key={tx.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                          {formatDateTime(tx.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Icon size={15} className={color} />
                            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[180px]">
                              {tx.description || getTxLabel(tx.type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            {tx.category || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`badge ${
                            tx.type === 'DEPOSIT' || tx.type === 'TRANSFER_IN' ? 'badge-success' : 'badge-danger'
                          }`}>{getTxLabel(tx.type)}</span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${getTxColor(tx.type)}`}>
                          {getTxPrefix(tx.type)}{formatCurrency(tx.amount)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500 dark:text-gray-400 text-xs">
                          {formatCurrency(tx.balanceAfter)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`badge ${
                            tx.status === 'COMPLETED' ? 'badge-success' :
                            tx.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                          }`}>{tx.status}</span>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((tx, i) => {
                const { Icon, color } = TYPE_ICONS[tx.type] || TYPE_ICONS.DEPOSIT
                return (
                  <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-800 ${color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {tx.description || getTxLabel(tx.type)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(tx.createdAt)}</p>
                    </div>
                    <span className={`font-bold text-sm ${getTxColor(tx.type)}`}>
                      {getTxPrefix(tx.type)}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {!loading && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {page * 10 + 1}–{Math.min((page + 1) * 10, data.totalElements)} of {data.totalElements}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
                <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              <span className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 self-center">
                {page + 1} / {data.totalPages}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages - 1}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
                <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
