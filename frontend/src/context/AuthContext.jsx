import React, { createContext, useContext, useState, useCallback } from 'react'
import { login as loginApi } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('lms_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback(async (username, password) => {
    const { data } = await loginApi(username, password)
    localStorage.setItem('lms_token', data.token)
    const userInfo = { username: data.username, role: data.role, expiresAt: data.expiresAt }
    localStorage.setItem('lms_user', JSON.stringify(userInfo))
    setUser(userInfo)
    return userInfo
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('lms_token')
    localStorage.removeItem('lms_user')
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'Admin'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
