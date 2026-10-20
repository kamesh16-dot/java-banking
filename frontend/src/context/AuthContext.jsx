import { createContext, useContext, useState, useEffect } from 'react'
import { accountApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('nexabank_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [accounts, setAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('nexabank_accounts')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const login = (userData) => {
    const accs = userData.accounts || []
    const userWithoutAccounts = { ...userData, accounts: undefined }
    setUser(userWithoutAccounts)
    setAccounts(accs)
    localStorage.setItem('nexabank_user', JSON.stringify(userWithoutAccounts))
    localStorage.setItem('nexabank_accounts', JSON.stringify(accs))
  }

  const logout = () => {
    setUser(null)
    setAccounts([])
    localStorage.removeItem('nexabank_user')
    localStorage.removeItem('nexabank_accounts')
  }

  const refreshAccounts = (newAccounts) => {
    setAccounts(newAccounts)
    localStorage.setItem('nexabank_accounts', JSON.stringify(newAccounts))
  }

  const updateAccount = (updatedAccount) => {
    setAccounts(prev => {
      const updated = prev.map(a => a.id === updatedAccount.id ? updatedAccount : a)
      localStorage.setItem('nexabank_accounts', JSON.stringify(updated))
      return updated
    })
  }

  const refreshUserAccounts = async () => {
    if (!user?.id) return accounts
    try {
      const freshAccounts = await accountApi.getByUser(user.id)
      setAccounts(freshAccounts)
      localStorage.setItem('nexabank_accounts', JSON.stringify(freshAccounts))
      return freshAccounts
    } catch (err) {
      console.error('Failed to refresh accounts:', err)
      return accounts
    }
  }

  return (
    <AuthContext.Provider value={{ user, accounts, login, logout, refreshAccounts, updateAccount, refreshUserAccounts }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
