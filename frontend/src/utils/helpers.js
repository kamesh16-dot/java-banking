// ─── Currency Formatting ──────────────────────────────────────────────────────
export const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

// ─── Date Formatting ──────────────────────────────────────────────────────────
export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Transaction Type Helpers ─────────────────────────────────────────────────
export const isCredit = (type) => ['DEPOSIT', 'TRANSFER_IN'].includes(type)

export const getTxColor = (type) =>
  isCredit(type) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'

export const getTxPrefix = (type) => (isCredit(type) ? '+' : '−')

export const getTxLabel = (type) => ({
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  TRANSFER_OUT: 'Transfer Out',
  TRANSFER_IN: 'Transfer In',
}[type] || type)

// ─── Account Helpers ──────────────────────────────────────────────────────────
export const maskAccount = (num) => {
  if (!num || num.length < 4) return num
  return '•••• ' + num.slice(-4)
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
export const exportCSV = (rows, filename = 'transactions.csv') => {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => `"${r[h] ?? ''}"`).join(','))
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Category Icons/Colors ────────────────────────────────────────────────────
export const categoryColor = (cat) => {
  const map = {
    Food:          '#f59e0b',
    Shopping:      '#8b5cf6',
    Transport:     '#3b82f6',
    Utilities:     '#06b6d4',
    Entertainment: '#ec4899',
    Health:        '#10b981',
    Income:        '#22c55e',
    Transfer:      '#6366f1',
  }
  return map[cat] || '#94a3b8'
}

// ─── Random avatar initials color ─────────────────────────────────────────────
export const getAvatarColor = (name = '') => {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
    'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
  ]
  const idx = (name.charCodeAt(0) || 0) % colors.length
  return colors[idx]
}

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
