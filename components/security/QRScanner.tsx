"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    jsQR: any
  }
}

interface QRScannerProps {
  onScan: (data: string) => void
}

export default function QRScanner({ onScan }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [permission, setPermission] = useState(false)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setPermission(true)
          scanQR()
        }
      } catch (error) {
        console.error("Camera error:", error)
        alert("Camera permission denied")
      }
    }

    startCamera()

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  const scanQR = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas?.getContext("2d")

    if (!canvas || !video || !ctx) return

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = window.jsQR(imageData.data, imageData.width, imageData.height)

        if (code) {
          onScan(code.data)
          return
        }
      }

      requestAnimationFrame(scan)
    }

    scan()
  }

  return (
    <div className="space-y-4">
      <video ref={videoRef} className="w-full rounded-lg bg-black aspect-video object-cover" autoPlay playsInline />
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-center text-gray-600 text-sm">Position QR code in front of camera</p>
    </div>
  )
}
