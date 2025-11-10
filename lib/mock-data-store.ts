// In-memory store for mock data (persists during session)
interface MockPass {
  id: number
  studentId: string
  student_name?: string
  teacher_id?: string
  teacher_name?: string
  reason: string
  date?: string
  time?: string
  status: "Pending" | "Approved" | "Rejected"
  qrCode?: string
  qr_verified?: boolean
  facial_verified?: boolean
  can_exit?: boolean
  createdAt: string
}

interface MockTeacher {
  id: string
  name: string
  email: string
  department: string
  is_present: boolean
}

const mockTeachersStore: MockTeacher[] = [
  {
    id: "T001",
    name: "Prof Jayshri Harde",
    email: "jayshri@example.com",
    department: "CSE",
    is_present: true,
  },
  {
    id: "T002",
    name: "Prof Ashish Dandekar",
    email: "ashish@example.com",
    department: "CSE",
    is_present: true,
  },
  {
    id: "T003",
    name: "Prof Kalyani Satone",
    email: "kalyani@example.com",
    department: "CSE",
    is_present: true,
  },
  {
    id: "T004",
    name: "Prof Brown",
    email: "brown@example.com",
    department: "CSE",
    is_present: true,
  },
]

const mockPassesStore: MockPass[] = [
  {
    id: 1,
    studentId: "STU001",
    student_name: "John Student",
    teacher_id: "T001",
    teacher_name: "Prof Jayshri Harde",
    reason: "Library Access",
    status: "Pending",
    date: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    studentId: "STU002",
    student_name: "Gauri Student",
    teacher_id: "T002",
    teacher_name: "Prof Ashish Dandekar",
    reason: "Lab Work",
    status: "Pending",
    date: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    studentId: "STU001",
    student_name: "John Student",
    teacher_id: "T001",
    teacher_name: "Prof Jayshri Harde",
    reason: "Previous Lab Session",
    status: "Approved",
    qrCode: `QR_PASS_3_${Date.now()}`,
    qr_verified: true,
    facial_verified: true,
    can_exit: true,
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 4,
    studentId: "STU003",
    student_name: "Rajesh Kumar",
    teacher_id: "T003",
    teacher_name: "Prof Kalyani Satone",
    reason: "Project Discussion",
    status: "Approved",
    qrCode: `QR_PASS_4_${Date.now()}`,
    qr_verified: false,
    facial_verified: false,
    can_exit: false,
    date: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: 5,
    studentId: "STU004",
    student_name: "Priya Sharma",
    teacher_id: "T002",
    teacher_name: "Prof Ashish Dandekar",
    reason: "Internship Meeting",
    status: "Approved",
    qrCode: `QR_PASS_5_${Date.now()}`,
    qr_verified: true,
    facial_verified: true,
    can_exit: true,
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 6,
    studentId: "STU005",
    student_name: "Amit Patel",
    teacher_id: "T001",
    teacher_name: "Prof Jayshri Harde",
    reason: "Interview Preparation",
    status: "Rejected",
    date: new Date(Date.now() - 259200000).toISOString().split("T")[0],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
]

export const mockDataStore = {
  // Get all passes
  getAllPasses: (): MockPass[] => mockPassesStore,

  // Get passes for a specific student
  getStudentPasses: (studentId: string): MockPass[] => {
    return mockPassesStore.filter((p) => p.studentId === studentId)
  },

  // Get all pending requests
  getPendingRequests: (): MockPass[] => {
    return mockPassesStore.filter((p) => p.status === "Pending")
  },

  // Create a new pass request
  createPassRequest: (
    data: Omit<MockPass, "id" | "createdAt" | "status" | "qr_verified" | "facial_verified" | "can_exit">,
  ): MockPass => {
    const newPass: MockPass = {
      ...data,
      id: Math.max(...mockPassesStore.map((p) => p.id), 0) + 1,
      status: "Pending",
      qr_verified: false,
      facial_verified: false,
      can_exit: false,
      createdAt: new Date().toISOString(),
    }
    mockPassesStore.push(newPass)
    console.log("[v0] Mock store: Created pass", newPass.id, newPass)
    return newPass
  },

  // Update pass status
  updatePassStatus: (passId: number, status: "Pending" | "Approved" | "Rejected"): MockPass | null => {
    const pass = mockPassesStore.find((p) => p.id === passId)
    if (pass) {
      pass.status = status
      if (status === "Approved") {
        pass.qrCode = `QR_PASS_${passId}_${Date.now()}`
      }
      console.log("[v0] Mock store: Updated pass", passId, "to status", status)
      return pass
    }
    return null
  },

  // Get pass by ID
  getPassById: (passId: number): MockPass | null => {
    return mockPassesStore.find((p) => p.id === passId) || null
  },

  getAllTeachers: (): MockTeacher[] => mockTeachersStore,

  getPresentTeachers: (): MockTeacher[] => {
    return mockTeachersStore.filter((t) => t.is_present)
  },

  toggleTeacherPresence: (teacherId: string): void => {
    const teacher = mockTeachersStore.find((t) => t.id === teacherId)
    if (teacher) {
      teacher.is_present = !teacher.is_present
      console.log("[v0] Teacher", teacherId, "presence toggled to", teacher.is_present)
    }
  },

  updatePassFacialVerification: (passId: number, isMatched: boolean): MockPass | null => {
    const pass = mockPassesStore.find((p) => p.id === passId)
    if (pass && pass.status === "Approved") {
      pass.facial_verified = isMatched
      if (pass.qr_verified && isMatched) {
        pass.can_exit = true
      }
      console.log("[v0] Pass", passId, "facial verification:", isMatched)
      return pass
    }
    return null
  },

  updatePassQRVerification: (passId: number): MockPass | null => {
    const pass = mockPassesStore.find((p) => p.id === passId)
    if (pass && pass.status === "Approved") {
      pass.qr_verified = true
      if (pass.facial_verified) {
        pass.can_exit = true
      }
      console.log("[v0] Pass", passId, "QR verified")
      return pass
    }
    return null
  },
}
