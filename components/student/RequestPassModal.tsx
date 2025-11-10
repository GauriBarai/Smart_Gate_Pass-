"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { requestPass, getAllTeachers } from "@/lib/api-client"

interface Teacher {
  id: string
  name: string
  department: string
  is_present: boolean
}

interface RequestPassModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function RequestPassModal({ onClose, onSuccess }: RequestPassModalProps) {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    reason: "",
    teacher_id: "",
    teacher_name: "",
  })
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTeachers, setLoadingTeachers] = useState(true)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem("token") || ""
      const result = await getAllTeachers(token)
      if (result.success) {
        const allTeachers = result.data.teachers || result.data || []
        setTeachers(allTeachers)
        if (allTeachers.length > 0) {
          setFormData((prev) => ({
            ...prev,
            teacher_id: allTeachers[0].id,
            teacher_name: allTeachers[0].name,
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching teachers:", error)
    } finally {
      setLoadingTeachers(false)
    }
  }

  const handleTeacherChange = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    if (teacher) {
      setFormData({
        ...formData,
        teacher_id: teacherId,
        teacher_name: teacher.name,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const studentId = localStorage.getItem("userId") || "student@example.com"
      const token = localStorage.getItem("token") || ""

      const result = await requestPass(token, {
        student_id: studentId,
        student_name: localStorage.getItem("userName") || "Student",
        teacher_id: formData.teacher_id,
        teacher_name: formData.teacher_name,
        reason: formData.reason,
        date: formData.date,
        time: formData.time,
      })

      if (result.success) {
        alert("Pass request submitted successfully!")
        onSuccess()
        onClose()
      } else {
        alert(result.error || "Error submitting request")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Connection error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-blue-100">
          <h2 className="text-xl font-bold text-gray-900">Request Gate Pass</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher Name *</label>
            {loadingTeachers ? (
              <div className="text-sm text-gray-500">Loading teachers...</div>
            ) : teachers.length === 0 ? (
              <div className="text-sm text-red-500">No teachers available</div>
            ) : (
              <select
                required
                value={formData.teacher_id}
                onChange={(e) => handleTeacherChange(e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select a teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.department})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
            <input
              type="time"
              required
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
            <textarea
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="Reason for pass request"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent border-blue-200 text-blue-600">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || teachers.length === 0}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
