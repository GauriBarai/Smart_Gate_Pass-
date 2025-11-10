"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState({ role: "", id: "", password: "" })
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [error, setError] = useState("")

  const roles = [
    { id: "student", label: "Student", color: "from-blue-500 to-blue-600", icon: "👨‍🎓" },
    { id: "faculty", label: "Faculty", color: "from-blue-400 to-blue-500", icon: "👨‍🏫" },
    { id: "hod", label: "Admin", color: "from-blue-600 to-blue-700", icon: "🔐" },
    { id: "security", label: "Security", color: "from-cyan-500 to-blue-600", icon: "🚨" },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { loginUser } = await import("@/lib/api-client")
      const result = await loginUser(credentials.role, credentials.id, credentials.password)

      if (result.success) {
        const data = result.data
        localStorage.setItem("token", data.token)
        localStorage.setItem("role", credentials.role)
        localStorage.setItem("userId", credentials.id)
        localStorage.setItem("userName", data.name)
        router.push(`/${credentials.role}/dashboard`)
      } else {
        setError(result.error || "Invalid credentials")
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (role: string) => {
    const demoCredentials: Record<string, string> = {
      student: "student@example.com",
      faculty: "faculty@example.com",
      hod: "hod@example.com",
      security: "security@example.com",
    }
    setCredentials({ role, id: demoCredentials[role] || `${role}@example.com`, password: "password" })
    setShowLoginForm(true)
  }

  if (showLoginForm && credentials.role) {
    const roleLabel = roles.find((r) => r.id === credentials.role)?.label
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-100">
            <button
              onClick={() => {
                setShowLoginForm(false)
                setCredentials({ role: "", id: "", password: "" })
                setError("")
              }}
              className="text-blue-600 hover:text-blue-700 mb-4 text-sm font-medium"
            >
              ← Back to Role Selection
            </button>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">{roleLabel} Login</h2>
            <p className="text-gray-600 mb-6">ST Vincent Pallotti College of Engineering & Technology</p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="User ID"
                value={credentials.id}
                onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <p className="font-semibold mb-1">Demo Credentials:</p>
              <p>ID: {credentials.id}</p>
              <p>Password: password</p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header with College Branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-blue-100 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-blue-700">ST Vincent Pallotti College of Engineering & Technology</h1>
          <p className="text-blue-600">Department of Computer Science Engineering (Data Science)</p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">Smart Gate Pass Management System</h2>
          <p className="text-lg text-gray-600">Advanced Campus Access Control with Dual Verification</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleDemoLogin(role.id)}
              className={`bg-gradient-to-br ${role.color} p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all cursor-pointer text-white border border-opacity-20 border-white`}
            >
              <div className="text-5xl mb-4">{role.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{role.label}</h3>
              <p className="text-sm opacity-95">Click to login</p>
            </motion.button>
          ))}
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
            <h3 className="text-lg font-bold text-blue-700 mb-2">QR Code Verification</h3>
            <p className="text-gray-600">Secure campus access through QR code scanning</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-600">
            <h3 className="text-lg font-bold text-blue-700 mb-2">Facial Recognition</h3>
            <p className="text-gray-600">Advanced AI-powered facial verification system</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-700">
            <h3 className="text-lg font-bold text-blue-700 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">Real-time insights and pass management system</p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-gray-500 text-sm py-6 border-t border-blue-100 mt-12"
      >
        <p>Smart Gate Pass System - Campus Access Management</p>
      </motion.div>
    </div>
  )
}
