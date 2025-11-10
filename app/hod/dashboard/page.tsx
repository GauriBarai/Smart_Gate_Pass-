"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HODDashboard from "@/components/hod/HODDashboard"
import { LogOut } from "lucide-react"

export default function AdminDashboardPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/")
    } else {
      setAuthenticated(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  if (!authenticated) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>
      <HODDashboard />
    </div>
  )
}
