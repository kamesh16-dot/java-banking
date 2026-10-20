import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, ArrowLeftRight, ClipboardList, LifeBuoy, ShieldCheck, PlusSquare } from 'lucide-react'

const links = [
  { to: '/',              label: 'Home',      icon: Home },
  { to: '/transfer',      label: 'Transfer',  icon: ArrowLeftRight },
  { to: '/transactions',  label: 'History',   icon: ClipboardList },
  { to: '/create-account', label: 'New Acct', icon: PlusSquare },
  { to: '/support',       label: 'Support',   icon: LifeBuoy },
]

export default function BottomNav() {
  const { user } = useAuth()

  const navLinks = user?.role === 'ADMIN'
    ? [...links, { to: '/admin', label: 'Admin', icon: ShieldCheck }]
    : links

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
      {navLinks.map(link => (
        <NavLink
          key={link.label}
          to={link.to}
          end={link.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-0 ${
              isActive
                ? 'text-primary-500'
                : 'text-gray-500 dark:text-gray-400'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <link.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {link.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-primary-500" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
