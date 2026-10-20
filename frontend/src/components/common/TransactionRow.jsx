import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react'
import { formatCurrency, formatDateTime, getTxColor, getTxPrefix, getTxLabel, isCredit } from '../../utils/helpers'
import { motion } from 'framer-motion'

const txIcons = {
  DEPOSIT:      { Icon: ArrowDownLeft,  bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' },
  WITHDRAWAL:   { Icon: ArrowUpRight,   bg: 'bg-red-100 dark:bg-red-900/30',         color: 'text-red-500 dark:text-red-400' },
  TRANSFER_OUT: { Icon: ArrowLeftRight, bg: 'bg-blue-100 dark:bg-blue-900/30',       color: 'text-blue-500 dark:text-blue-400' },
  TRANSFER_IN:  { Icon: ArrowLeftRight, bg: 'bg-indigo-100 dark:bg-indigo-900/30',   color: 'text-indigo-500 dark:text-indigo-400' },
}

function TransactionRow({ tx, index = 0 }) {
  const { Icon, bg, color } = txIcons[tx.type] || txIcons.DEPOSIT

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-4 py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={color} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
          {tx.description || getTxLabel(tx.type)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {formatDateTime(tx.createdAt)}
          {tx.category && <span className="ml-2 px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">{tx.category}</span>}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${getTxColor(tx.type)}`}>
          {getTxPrefix(tx.type)}{formatCurrency(tx.amount)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Bal: {formatCurrency(tx.balanceAfter)}
        </p>
      </div>
    </motion.div>
  )
}

export default TransactionRow
