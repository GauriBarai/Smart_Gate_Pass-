/**
 * API Client that works in preview, local, and production environments
 * In preview mode, uses mock data. In other modes, connects to real backend.
 */

import { mockDataStore } from "./mock-data-store"

const IS_PREVIEW =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("v0.app") ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    !process.env.NEXT_PUBLIC_API_URL)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

if (typeof window !== "undefined") {
  console.log("[v0] IS_PREVIEW:", IS_PREVIEW, "API_URL:", API_URL, "Hostname:", window.location.hostname)
}

// Mock data for preview mode - expanded to include various demo credentials
const MOCK_USERS: Record<string, { password: string; name: string }> = {
  "student@gmail.com": { password: "password", name: "John Student" },
  "student@example.com": { password: "password", name: "John Student" },
  "gauri@gmail.com": { password: "password", name: "Gauri Student" },
  "faculty@example.com": { password: "password", name: "Dr. Faculty" },
  "hod@example.com": { password: "password", name: "Prof. HOD" },
  "security@example.com": { password: "password", name: "Security Guard" },
}

export async function loginUser(role: string, userId: string, password: string) {
  console.log("[v0] Login attempt - Role:", role, "UserID:", userId, "Preview mode:", IS_PREVIEW)

  // In preview mode or if no backend URL set, use mock login immediately
  if (IS_PREVIEW) {
    return mockLogin(role, userId, password)
  }

  // Try real backend first if API_URL is configured
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        user_id: userId,
        password,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("[v0] Login successful with real backend")
      return { success: true, data }
    } else {
      const errorData = await response.json()
      return { success: false, error: errorData.error || "Invalid credentials" }
    }
  } catch (error) {
    console.error("[v0] API connection error:", error)
    console.log("[v0] Falling back to mock data")
    return mockLogin(role, userId, password)
  }
}

function mockLogin(role: string, userId: string, password: string) {
  console.log("[v0] Using mock login for preview/offline mode")

  if (!userId || !password) {
    return { success: false, error: "Please enter credentials" }
  }

  // Check if user exists in mock users
  const user = MOCK_USERS[userId]
  if (user && user.password === password) {
    const token = Buffer.from(`${role}:${userId}:${Date.now()}`).toString("base64")
    console.log("[v0] Mock login successful for:", userId)
    return {
      success: true,
      data: {
        token,
        user_id: userId,
        role,
        name: user.name,
      },
    }
  }

  if (IS_PREVIEW) {
    console.log("[v0] Preview mode: accepting any credentials")
    const token = Buffer.from(`${role}:${userId}:${Date.now()}`).toString("base64")
    return {
      success: true,
      data: {
        token,
        user_id: userId,
        role,
        name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      },
    }
  }

  return { success: false, error: "Invalid credentials" }
}

export async function getStudentPasses(token: string) {
  return apiCall("/api/student/passes", "GET", null, token)
}

export async function requestPass(token: string, data: any) {
  return apiCall("/api/student/request", "POST", data, token)
}

export async function getFacultyRequests(token: string) {
  return apiCall("/api/faculty/requests", "GET", null, token)
}

export async function approveFacultyRequest(token: string, passId: number, status: string) {
  return apiCall(`/api/faculty/request/${passId}`, "PUT", { status }, token)
}

export async function getHODStats(token: string) {
  return apiCall("/api/hod/stats", "GET", null, token)
}

export async function verifyQRCode(token: string, qrData: string) {
  return apiCall("/api/security/verify-qr", "POST", { qr_data: qrData }, token)
}

export async function verifyFaceRecognition(token: string, imageData: string) {
  return apiCall("/api/security/verify-face", "POST", { image_data: imageData }, token)
}

// New endpoints for teachers, verification, and QR code generation
export async function getAllTeachers(token: string) {
  return apiCall("/api/teachers", "GET", null, token)
}

export async function getPresentTeachers(token: string) {
  return apiCall("/api/teachers/present", "GET", null, token)
}

export async function toggleTeacherPresence(token: string, teacherId: string) {
  return apiCall(`/api/teachers/${teacherId}/presence`, "PUT", {}, token)
}

export async function verifyQRAndFacial(token: string, passId: number, qrData: string) {
  return apiCall("/api/security/verify", "POST", { pass_id: passId, qr_data: qrData }, token)
}

export async function updateFacialVerification(token: string, passId: number, isMatched: boolean) {
  return apiCall(`/api/security/facial-verify/${passId}`, "PUT", { verified: isMatched }, token)
}

export async function getPassForExit(passId: number) {
  return apiCall(`/api/passes/${passId}/exit-status`, "GET", null)
}

async function apiCall(endpoint: string, method: string, body: any, token?: string) {
  if (IS_PREVIEW) {
    return mockApiCall(endpoint, method, body)
  }

  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_URL}${endpoint}`, options)

    if (response.ok) {
      return { success: true, data: await response.json() }
    } else {
      const error = await response.json()
      return { success: false, error: error.error || "Request failed" }
    }
  } catch (error) {
    console.error("[v0] API call error:", error)
    console.log("[v0] Falling back to mock data for endpoint:", endpoint)
    return mockApiCall(endpoint, method, body)
  }
}

function mockApiCall(endpoint: string, method: string, body: any) {
  console.log("[v0] Mock API call:", endpoint, method)

  // Student passes endpoint
  if (endpoint === "/api/student/passes" && method === "GET") {
    // In mock mode, return passes for all students
    const passes = mockDataStore.getAllPasses()
    return {
      success: true,
      data: {
        passes,
      },
    }
  }

  // Student request pass endpoint
  if (endpoint === "/api/student/request" && method === "POST") {
    const pass = mockDataStore.createPassRequest({
      studentId: body.student_id || "STU001",
      student_name: body.student_name || "John Student",
      teacher_id: body.teacher_id,
      teacher_name: body.teacher_name,
      reason: body.reason,
      date: body.date,
      time: body.time,
    })
    return {
      success: true,
      data: {
        pass,
        message: "Pass request created successfully",
      },
    }
  }

  // Faculty requests endpoint
  if (endpoint === "/api/faculty/requests" && method === "GET") {
    const requests = mockDataStore.getAllPasses()
    return {
      success: true,
      data: {
        requests,
      },
    }
  }

  // Faculty approve/reject endpoint
  if (endpoint.match(/\/api\/faculty\/request\/\d+/) && method === "PUT") {
    const passId = Number.parseInt(endpoint.split("/").pop() || "0")
    const status = body.status || "Pending"
    const pass = mockDataStore.updatePassStatus(passId, status)
    if (pass) {
      return {
        success: true,
        data: {
          pass,
          message: `Pass ${status.toLowerCase()} successfully`,
        },
      }
    }
    return {
      success: false,
      error: "Pass not found",
    }
  }

  // HOD stats endpoint
  if (endpoint === "/api/hod/stats" && method === "GET") {
    const allPasses = mockDataStore.getAllPasses()
    return {
      success: true,
      data: {
        totalRequests: allPasses.length,
        approvedPasses: allPasses.filter((p) => p.status === "Approved").length,
        rejectedPasses: allPasses.filter((p) => p.status === "Rejected").length,
        pendingPasses: allPasses.filter((p) => p.status === "Pending").length,
      },
    }
  }

  // Teachers endpoint
  if (endpoint === "/api/teachers" && method === "GET") {
    const teachers = mockDataStore.getAllTeachers()
    return {
      success: true,
      data: {
        teachers,
      },
    }
  }

  if (endpoint === "/api/teachers/present" && method === "GET") {
    const presentTeachers = mockDataStore.getPresentTeachers()
    return {
      success: true,
      data: {
        presentTeachers,
      },
    }
  }

  if (endpoint.match(/\/api\/teachers\/\w+\/presence/) && method === "PUT") {
    const teacherId = endpoint.split("/").pop() || ""
    const presence = mockDataStore.toggleTeacherPresence(teacherId)
    if (presence) {
      return {
        success: true,
        data: {
          presence,
          message: "Teacher presence toggled successfully",
        },
      }
    }
    return {
      success: false,
      error: "Teacher not found",
    }
  }

  // Security verification endpoint
  if (endpoint === "/api/security/verify" && method === "POST") {
    const passId = body.pass_id || 0
    const qrData = body.qr_data || ""
    const verificationResult = mockDataStore.verifyQRAndFacial(passId, qrData)
    return {
      success: true,
      data: {
        verificationResult,
      },
    }
  }

  if (endpoint.match(/\/api\/security\/facial-verify\/\d+/) && method === "PUT") {
    const passId = Number.parseInt(endpoint.split("/").pop() || "0")
    const isMatched = body.verified || false
    const facialVerificationResult = mockDataStore.updateFacialVerification(passId, isMatched)
    if (facialVerificationResult) {
      return {
        success: true,
        data: {
          facialVerificationResult,
          message: "Facial verification updated successfully",
        },
      }
    }
    return {
      success: false,
      error: "Pass not found",
    }
  }

  // Pass exit status endpoint
  if (endpoint.match(/\/api\/passes\/\d+\/exit-status/) && method === "GET") {
    const passId = Number.parseInt(endpoint.split("/").pop() || "0")
    const passExitStatus = mockDataStore.getPassForExit(passId)
    return {
      success: true,
      data: {
        passExitStatus,
      },
    }
  }

  return { success: true, data: {} }
}
