import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { formatCurrency, getInitials, getAvatarColor } from '../../utils/helpers'
import { Menu, Sun, Moon, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react'

export default function TopBar({ onMenuClick }) {
  const { user, accounts, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const totalBalance = accounts.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0)
  const totalCredit = accounts.reduce((sum, a) => sum + parseFloat(a.availableCredit || 0), 0)

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="glass dark:glass sticky top-0 z-30 border-b border-gray-200/50 dark:border-gray-800/50 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Hamburger + Balances */}
      <div className="flex items-center gap-4">
        <button
          id="sidebar-toggle"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <Menu size={20} className="text-gray-600 dark:text-gray-400" />
        </button>

        <div className="hidden sm:flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Balance</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Available Credit</p>
            <p className="text-lg font-bold text-primary-500">
              {formatCurrency(totalCredit)}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          id="theme-toggle"
          onClick={toggle}
          className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          {dark
            ? <Sun size={18} className="text-amber-400" />
            : <Moon size={18} className="text-gray-500" />
          }
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell size={18} className="text-gray-500 dark:text-gray-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        {/* Avatar Menu */}
        <div className="relative" ref={menuRef}>
          <button
            id="user-menu-btn"
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full ${getAvatarColor(user?.name)} flex items-center justify-center text-white text-sm font-bold`}>
              {getInitials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">
                {user?.name?.split(' ')[0]}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
              </p>
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{user?.email}</p>
              </div>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <User size={15} /> Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Settings size={15} /> Settings
              </button>
              <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                <button
                  id="logout-btn"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
