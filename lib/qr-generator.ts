import QRCode from "qrcode"

export async function generateQRCode(passId: number, studentName: string, date: string): Promise<string> {
  const data = JSON.stringify({
    pass_id: passId,
    student: studentName,
    date: date,
    timestamp: new Date().toISOString(),
  })

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 300,
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error("Error generating QR code:", error)
    return ""
  }
}

export function downloadQRCode(passId: number, qrDataUrl: string) {
  const link = document.createElement("a")
  link.href = qrDataUrl
  link.download = `pass_${passId}_qr.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
