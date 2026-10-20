import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Home, PlusCircle, MinusCircle, ArrowLeftRight, FileText, LifeBuoy, ShieldCheck, PlusSquare, X
} from 'lucide-react'

const links = [
  { to: '/',                label: 'Dashboard',     icon: Home },
  { to: '/deposit',         label: 'Deposit',       icon: PlusCircle },
  { to: '/withdraw',        label: 'Withdraw',      icon: MinusCircle },
  { to: '/transfer',        label: 'Transfer',      icon: ArrowLeftRight },
  { to: '/transactions',    label: 'Transactions',  icon: FileText },
  { to: '/create-account',  label: 'New Account',   icon: PlusSquare },
  { to: '/support',         label: 'Support',       icon: LifeBuoy },
]

const adminLinks = [
  { to: '/admin', label: 'Admin Panel', icon: ShieldCheck },
]

export default function Sidebar({ onClose }) {
  const { user } = useAuth()

  return (
    <div className="flex flex-col w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">N</span>
          </div>
          <span className="text-xl font-bold text-gradient">NexaBank</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden">
            <X size={18} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {links.map((link) => (
          <NavLink
            key={link.id || link.label}
            to={link.to}
            end={link.to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
            }
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <>
            <div className="pt-4 pb-2 px-2">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">
                Administration
              </span>
            </div>
            {adminLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-400 dark:text-gray-600">
          Demo Banking Platform v1.0
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
          © 2024 NexaBank Inc.
        </p>
      </div>
    </div>
  )
}
