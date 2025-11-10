"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"

interface FacialRecognitionProps {
  onVerification: (isMatched: boolean) => void
  passId: string
}

export default function FacialRecognition({ onVerification, passId }: FacialRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"scanning" | "processing" | "completed" | "error" | null>(null)

  useEffect(() => {
    // Load face-api script
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js"
    document.body.appendChild(script)

    script.onload = () => {
      startCamera()
    }

    return () => {
      document.body.removeChild(script)
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStatus("scanning")
        setTimeout(() => captureFace(), 3000)
      }
    } catch (error) {
      console.error("Camera error:", error)
      setStatus("error")
      alert("Camera permission denied")
    }
  }

  const captureFace = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setStatus("processing")
    setLoading(true)

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const video = videoRef.current

    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // In preview mode, randomly approve/reject for testing
    setTimeout(() => {
      const isVerified = Math.random() > 0.3 // 70% success rate for testing
      console.log("[v0] Facial recognition result:", isVerified)

      setStatus("completed")
      onVerification(isVerified)
      setLoading(false)
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <video ref={videoRef} className="w-full rounded-lg bg-black aspect-video object-cover" autoPlay playsInline />
      <canvas ref={canvasRef} className="hidden" />

      {status === "scanning" && (
        <div className="p-4 bg-blue-100 text-blue-800 rounded-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-800 border-t-transparent" />
          <span>Scanning face... Position yourself clearly in frame</span>
        </div>
      )}

      {status === "processing" && (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-800 border-t-transparent" />
          <span>Verifying facial features...</span>
        </div>
      )}

      {status === "error" && (
        <div className="p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Facial recognition failed. Please try again.</span>
        </div>
      )}
    </div>
  )
}
