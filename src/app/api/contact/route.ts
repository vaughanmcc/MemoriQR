import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      email, 
      subject, 
      message, 
      type,
      // Partner application fields
      businessName,
      contactName,
      phone,
      businessType,
      expectedQrSales,
      expectedNfcSales
    } = body

    // Determine if this is a partner application
    const isPartnerApplication = type === 'partner_application'

    // Validate required fields based on form type
    if (isPartnerApplication) {
      if (!businessName || !contactName || !email || !businessType) {
        return NextResponse.json(
          { error: 'Business name, contact name, email, and business type are required' },
          { status: 400 }
        )
      }
    } else {
      if (!name || !email || !message) {
        return NextResponse.json(
          { error: 'Name, email, and message are required' },
          { status: 400 }
        )
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Send to Pipedream webhook
    const webhookUrl = process.env.PIPEDREAM_WEBHOOK_URL
    
    if (!webhookUrl) {
      console.error('PIPEDREAM_WEBHOOK_URL not configured')
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    // Build webhook payload based on form type
    const webhookPayload = isPartnerApplication ? {
      type: 'partner_application',
      businessName,
      contactName,
      email,
      phone: phone || '',
      businessType,
      message: message || '',
      expectedQrSales: expectedQrSales || 'Not specified',
      expectedNfcSales: expectedNfcSales || 'Not specified',
      submitted_at: new Date().toISOString(),
      source: 'memoriqr.co.nz/partners',
    } : {
      type: 'contact_form',
      name,
      email,
      subject: subject || 'General Inquiry',
      message,
      submitted_at: new Date().toISOString(),
      source: 'memoriqr.co.nz',
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })

    if (!webhookResponse.ok) {
      console.error('Pipedream webhook failed:', webhookResponse.status)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: isPartnerApplication 
        ? 'Your partner application has been submitted successfully' 
        : 'Your message has been sent successfully'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
