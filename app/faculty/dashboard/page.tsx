"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import FacultyDashboard from "@/components/faculty/FacultyDashboard"
import { LogOut } from "lucide-react"

export default function FacultyDashboardPage() {
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>
      <FacultyDashboard />
    </div>
  )
}
