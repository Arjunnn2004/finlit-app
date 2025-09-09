import React, { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebaseConfig'
import ThemeProvider from './contexts/ThemeContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

function AppContent() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-900 dark:text-gray-100">Loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login/>} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard/> : <Navigate to="/login" />} 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default function App(){
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}