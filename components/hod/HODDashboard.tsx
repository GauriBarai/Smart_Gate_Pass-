"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { motion } from "framer-motion"
import { mockDataStore } from "@/lib/mock-data-store"

export default function HODDashboard() {
  const [stats, setStats] = useState({
    total_passes: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    approval_rate: 0,
  })
  const [weeklyData, setWeeklyData] = useState<
    Array<{ day: string; approved: number; rejected: number; pending: number }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    calculateStats()
  }, [])

  const calculateStats = () => {
    // Get all passes
    const allPasses = mockDataStore.getAllPasses()

    const total = allPasses.length
    const approved = allPasses.filter((p) => p.status === "Approved").length
    const rejected = allPasses.filter((p) => p.status === "Rejected").length
    const pending = allPasses.filter((p) => p.status === "Pending").length
    const approval_rate = total > 0 ? Math.round((approved / total) * 100) : 0

    setStats({
      total_passes: total,
      approved,
      rejected,
      pending,
      approval_rate,
    })

    const weeklyStats: { [key: string]: { approved: number; rejected: number; pending: number } } = {}
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    days.forEach((day) => {
      weeklyStats[day] = { approved: 0, rejected: 0, pending: 0 }
    })

    // Distribute passes across the week
    allPasses.forEach((pass, index) => {
      const dayIndex = index % 7
      const status = pass.status.toLowerCase() as "approved" | "rejected" | "pending"
      weeklyStats[days[dayIndex]][status]++
    })

    const chartData = days.map((day) => ({
      day,
      ...weeklyStats[day],
    }))

    setWeeklyData(chartData)
    setLoading(false)
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading analytics...</div>
  }

  const pieData = [
    { name: "Approved", value: stats.approved },
    { name: "Rejected", value: stats.rejected },
    { name: "Pending", value: stats.pending },
  ]

  const COLORS = ["#3b82f6", "#ef4444", "#f59e0b"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg"
      >
        <h1 className="text-3xl font-bold mb-2">Admin Analytics Dashboard</h1>
        <p className="text-blue-100">ST Vincent Pallotti College - Campus Pass System</p>
      </motion.div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Key Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <Card className="bg-white border-l-4 border-blue-500 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{stats.total_passes}</div>
                <p className="text-gray-600 mt-2 font-semibold">Total Passes</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-green-500 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-gray-600 mt-2 font-semibold">Approved</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-red-500 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600">{stats.rejected}</div>
                <p className="text-gray-600 mt-2 font-semibold">Rejected</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-yellow-500 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-gray-600 mt-2 font-semibold">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-4 border-purple-500 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">{stats.approval_rate}%</div>
                <p className="text-gray-600 mt-2 font-semibold">Approval Rate</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Weekly Pass Trends */}
          <Card className="shadow-lg border border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-blue-700">Weekly Pass Trends</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "#f3f4f6", border: "1px solid #d1d5db" }} />
                  <Legend />
                  <Bar dataKey="approved" fill="#3b82f6" name="Approved" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="rejected" fill="#ef4444" name="Rejected" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pass Status Distribution */}
          <Card className="shadow-lg border border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-blue-700">Pass Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${Math.round(percent * 100)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} passes`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <Card className="shadow-lg border border-blue-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="text-green-700">Approved Passes</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-bold text-green-600">{stats.approval_rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.approval_rate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-blue-100">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-yellow-100">
              <CardTitle className="text-yellow-700">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Action Needed:</span>
                  <span className="font-bold text-yellow-600">{stats.pending}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Awaiting faculty review</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border border-blue-100">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
              <CardTitle className="text-red-700">Rejection Rate</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rejected:</span>
                  <span className="font-bold text-red-600">{stats.rejected}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Total rejected passes</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
