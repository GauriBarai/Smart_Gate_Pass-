"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, XCircle, Plus, Download } from "lucide-react"
import RequestPassModal from "./RequestPassModal"
import { getStudentPasses } from "@/lib/api-client"
import { generateQRCode, downloadQRCode } from "@/lib/qr-generator"

interface Pass {
  id: number
  reason: string
  date?: string
  time?: string
  status: string
  teacher_name?: string
  reviewed_by?: string
  createdAt?: string
  can_exit?: boolean
}

export default function StudentDashboard() {
  const [passes, setPasses] = useState<Pass[]>([])
  const [loading, setLoading] = useState(true)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [qrCodes, setQrCodes] = useState<Record<number, string>>({})
  const [generatingQR, setGeneratingQR] = useState<Record<number, boolean>>({})

  useEffect(() => {
    fetchPasses()
  }, [])

  const fetchPasses = async () => {
    try {
      const token = localStorage.getItem("token") || ""
      const result = await getStudentPasses(token)
      if (result.success) {
        setPasses(result.data.passes || [])
      }
    } catch (error) {
      console.error("Error fetching passes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQR = async (pass: Pass) => {
    setGeneratingQR((prev) => ({ ...prev, [pass.id]: true }))
    try {
      const qrData = await generateQRCode(pass.id, localStorage.getItem("userName") || "Student", pass.date || "")
      setQrCodes((prev) => ({ ...prev, [pass.id]: qrData }))
    } catch (error) {
      console.error("Error generating QR:", error)
      alert("Failed to generate QR code")
    } finally {
      setGeneratingQR((prev) => ({ ...prev, [pass.id]: false }))
    }
  }

  const handleDownloadQR = (pass: Pass) => {
    const qrData = qrCodes[pass.id]
    if (qrData) {
      downloadQRCode(pass.id, qrData)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "Pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "Rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>My Pass Requests</CardTitle>
              <CardDescription>View and manage your gate pass requests</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : passes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No pass requests yet. Create your first request!</div>
              ) : (
                <div className="space-y-4">
                  {passes.map((pass) => (
                    <div key={pass.id} className="border rounded-lg p-4 space-y-3 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(pass.status)}
                          <div>
                            <p className="font-semibold text-gray-900">{pass.reason}</p>
                            <p className="text-sm text-gray-600">
                              {pass.teacher_name && `Teacher: ${pass.teacher_name}`}
                            </p>
                            <p className="text-sm text-gray-600">{pass.date || pass.createdAt}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pass.status)}`}>
                          {pass.status}
                        </span>
                      </div>

                      {pass.status === "Approved" && (
                        <div className="border-t pt-3 space-y-2">
                          {pass.can_exit ? (
                            <div className="bg-green-50 border border-green-200 p-2 rounded text-sm text-green-700 font-medium">
                              ✓ Verified - You are eligible to exit campus
                            </div>
                          ) : (
                            <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-sm text-yellow-700">
                              Pending verification at security checkpoint
                            </div>
                          )}
                          <div className="flex gap-2">
                            {!qrCodes[pass.id] ? (
                              <Button
                                onClick={() => handleGenerateQR(pass)}
                                disabled={generatingQR[pass.id]}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {generatingQR[pass.id] ? "Generating..." : "Generate QR Code"}
                              </Button>
                            ) : (
                              <>
                                <Button
                                  onClick={() => handleDownloadQR(pass)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download QR
                                </Button>
                                <Button
                                  onClick={() => setQrCodes((prev) => ({ ...prev, [pass.id]: "" }))}
                                  size="sm"
                                  variant="outline"
                                >
                                  Generate New
                                </Button>
                              </>
                            )}
                          </div>
                          {qrCodes[pass.id] && (
                            <div className="bg-gray-50 p-4 rounded flex justify-center">
                              <img
                                src={qrCodes[pass.id] || "/placeholder.svg"}
                                alt="QR Code"
                                className="w-32 h-32 border border-gray-300 rounded"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowRequestModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Request New Pass
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {showRequestModal && (
        <RequestPassModal
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false)
            fetchPasses()
          }}
        />
      )}
    </div>
  )
}
