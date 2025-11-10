"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scan, Camera, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import QRScanner from "./QRScanner"
import FacialRecognition from "./FacialRecognition"

type VerificationMode = "qr" | "facial" | null

interface VerificationResult {
  success: boolean
  message: string
  passId?: number
  studentName?: string
}

export default function SecurityDashboard() {
  const [mode, setMode] = useState<VerificationMode>(null)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [scannedQR, setScannedQR] = useState<string>("")
  const [qrVerified, setQrVerified] = useState(false)
  const [facialVerified, setFacialVerified] = useState(false)

  const handleQRScan = (data: string) => {
    console.log("[v0] QR Scanned:", data)
    setScannedQR(data)
    setQrVerified(true)
    setResult({
      success: true,
      message: "✓ QR Code verified successfully! Please proceed to facial recognition.",
      passId: Number.parseInt(data.split("_")[2]) || 0,
    })
    // Auto-switch to facial recognition after a brief delay
    setTimeout(() => setMode("facial"), 2000)
  }

  const handleFacialVerification = (isMatched: boolean) => {
    setFacialVerified(isMatched)

    if (isMatched && qrVerified) {
      setResult({
        success: true,
        message: "✓ Dual Verification Complete! You are authorized to exit campus.",
      })
    } else if (isMatched && !qrVerified) {
      setResult({
        success: false,
        message: "⚠ Facial recognition passed but QR verification is pending.",
      })
    } else {
      setResult({
        success: false,
        message: "✗ Facial recognition verification failed. Access denied.",
      })
    }
  }

  const resetVerification = () => {
    setMode(null)
    setResult(null)
    setScannedQR("")
    setQrVerified(false)
    setFacialVerified(false)
  }

  const bothVerified = qrVerified && facialVerified

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
          <CardTitle className="text-blue-900">Dual Verification System</CardTitle>
          <CardDescription>QR Code Scanning + Facial Recognition for Campus Exit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {!mode ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold">Verification Process:</p>
                  <p>1. Scan your gate pass QR code 2. Complete facial recognition 3. Get exit approval</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={() => setMode("qr")}
                  className="h-32 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Scan className="w-8 h-8" />
                    <span>Start QR Scan</span>
                  </div>
                </Button>
                <Button
                  onClick={() => setMode("facial")}
                  className="h-32 bg-cyan-600 hover:bg-cyan-700 text-white transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-8 h-8" />
                    <span>Facial Recognition</span>
                  </div>
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                onClick={resetVerification}
                variant="outline"
                className="w-full bg-transparent border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                ← Back to Start
              </Button>

              {mode === "qr" && <QRScanner onScan={handleQRScan} />}
              {mode === "facial" && <FacialRecognition onVerification={handleFacialVerification} passId={scannedQR} />}

              {result && (
                <div
                  className={`p-4 rounded-lg flex items-center gap-3 animate-fadeIn ${
                    result.success
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold">{result.message}</p>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg space-y-3 border border-gray-200">
                <p className="font-semibold text-gray-900">Verification Status:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full transition-colors ${
                        qrVerified ? "bg-green-600" : "bg-gray-300"
                      }`}
                    />
                    <span className={`text-sm ${qrVerified ? "text-green-700 font-semibold" : "text-gray-600"}`}>
                      QR Code: {qrVerified ? "✓ Verified" : "Pending"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full transition-colors ${
                        facialVerified ? "bg-green-600" : "bg-gray-300"
                      }`}
                    />
                    <span className={`text-sm ${facialVerified ? "text-green-700 font-semibold" : "text-gray-600"}`}>
                      Facial Recognition: {facialVerified ? "✓ Verified" : "Pending"}
                    </span>
                  </div>
                </div>
                {bothVerified && (
                  <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded text-green-800 text-sm font-semibold">
                    ✓ All verifications complete - Exit authorized!
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
