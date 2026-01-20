import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://app.memoriqr.com'
    const memorialUrl = `${baseUrl}/memorial/${slug}`

    // Generate QR code as PNG buffer
    const qrBuffer = await QRCode.toBuffer(memorialUrl, {
      type: 'png',
      width: 400,
      margin: 2,
      color: {
        dark: '#1A1A1A',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })

    return new NextResponse(qrBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('QR code generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}
