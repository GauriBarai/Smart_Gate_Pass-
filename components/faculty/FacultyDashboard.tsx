"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Eye, EyeOff } from "lucide-react"
import { getFacultyRequests, approveFacultyRequest, toggleTeacherPresence, getAllTeachers } from "@/lib/api-client"

interface Pass {
  id: number
  student_name?: string
  studentId?: string
  teacher_name?: string
  reason: string
  date?: string
  time?: string
  status: string
  createdAt?: string
}

interface Teacher {
  id: string
  name: string
  email: string
  department: string
  is_present: boolean
}

export default function FacultyDashboard() {
  const [passes, setPasses] = useState<Pass[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Rejected">("Pending")
  const [showTeacherPresence, setShowTeacherPresence] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token") || ""
      const [passesResult, teachersResult] = await Promise.all([getFacultyRequests(token), getAllTeachers(token)])

      if (passesResult.success) {
        setPasses(passesResult.data.requests || [])
      }
      if (teachersResult.success) {
        setTeachers(teachersResult.data.teachers || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePresence = async (teacherId: string) => {
    try {
      const token = localStorage.getItem("token") || ""
      const result = await toggleTeacherPresence(token, teacherId)
      if (result.success) {
        fetchData()
        alert("Presence status updated")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleApprove = async (passId: number) => {
    try {
      const token = localStorage.getItem("token") || ""
      const result = await approveFacultyRequest(token, passId, "Approved")

      if (result.success) {
        fetchData()
        alert("Pass approved successfully!")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleReject = async (passId: number) => {
    const reason = prompt("Enter rejection reason:")
    if (!reason) return

    try {
      const token = localStorage.getItem("token") || ""
      const result = await approveFacultyRequest(token, passId, "Rejected")

      if (result.success) {
        fetchData()
        alert("Pass rejected successfully!")
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const filteredPasses = passes.filter((p) => p.status === activeTab)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Teacher Attendance</CardTitle>
            <CardDescription>Mark your presence for today</CardDescription>
          </div>
          <Button onClick={() => setShowTeacherPresence(!showTeacherPresence)} variant="outline" size="sm">
            {showTeacherPresence ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </CardHeader>
        {showTeacherPresence && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{teacher.name}</p>
                    <p className="text-sm text-gray-600">{teacher.department}</p>
                  </div>
                  <Button
                    onClick={() => handleTogglePresence(teacher.id)}
                    size="sm"
                    className={teacher.is_present ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 hover:bg-gray-500"}
                  >
                    {teacher.is_present ? "Present" : "Absent"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pass Requests</CardTitle>
          <CardDescription>Review and manage student gate pass requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6 border-b">
            {(["Pending", "Approved", "Rejected"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 border-b-2 font-medium ${
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab} ({passes.filter((p) => p.status === tab).length})
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredPasses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No {activeTab.toLowerCase()} requests</div>
          ) : (
            <div className="space-y-4">
              {filteredPasses.map((pass) => (
                <div key={pass.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{pass.student_name || pass.studentId}</p>
                      <p className="text-sm text-gray-600">{pass.reason}</p>
                      <p className="text-xs text-gray-500">{pass.date || pass.createdAt}</p>
                    </div>
                    {pass.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(pass.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button onClick={() => handleReject(pass.id)} size="sm" variant="destructive">
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
