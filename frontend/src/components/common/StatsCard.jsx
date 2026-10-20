import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatsCard({ title, value, sub, icon: Icon, trend, color = 'blue', delay = 0 }) {
  const colorMap = {
    blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',   icon: 'text-primary-500', border: 'border-blue-100 dark:border-blue-800' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-500', border: 'border-emerald-100 dark:border-emerald-800' },
    purple:  { bg: 'bg-purple-50 dark:bg-purple-900/20',  icon: 'text-purple-500',  border: 'border-purple-100 dark:border-purple-800' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',    icon: 'text-amber-500',   border: 'border-amber-100 dark:border-amber-800' },
    rose:    { bg: 'bg-rose-50 dark:bg-rose-900/20',      icon: 'text-rose-500',    border: 'border-rose-100 dark:border-rose-800' },
  }
  const c = colorMap[color] || colorMap.blue

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="card card-hover cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${c.bg} border ${c.border}`}>
          <Icon size={22} className={c.icon} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon size={14} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}
