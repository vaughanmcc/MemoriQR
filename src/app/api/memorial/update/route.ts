import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sanitizeText } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, session, memorialText, theme, frame } = body

    if (!token) {
      return NextResponse.json({ error: 'Edit token is required' }, { status: 400 })
    }

    if (!session) {
      return NextResponse.json({ error: 'Session expired. Please refresh the page and verify your email again.' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // First verify the token and get the memorial
    const { data: memorial, error: lookupError } = await supabase
      .from('memorial_records')
      .select('id, hosting_duration')
      .eq('edit_token', token)
      .single()

    if (lookupError || !memorial) {
      return NextResponse.json({ error: 'Invalid edit token. Please use the original edit link from your email.' }, { status: 403 })
    }

    // Verify session token is valid and not expired
    const { data: sessionData, error: sessionError } = await supabase
      .from('edit_verification_codes')
      .select('*')
      .eq('memorial_id', memorial.id)
      .eq('code', `SESSION:${session}`)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'Session expired. Please refresh the page and verify your email again.' }, { status: 401 })
    }

    // Validate theme and frame against plan limits
    const duration = memorial.hosting_duration
    const maxOptions = duration === 5 ? 5 : duration === 10 ? 10 : 25

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (memorialText !== undefined) {
      updateData.memorial_text = sanitizeText(memorialText)
    }

    if (theme !== undefined) {
      updateData.theme = theme
    }

    if (frame !== undefined) {
      updateData.frame = frame
    }

    // Update the memorial
    const { error: updateError } = await supabase
      .from('memorial_records')
      .update(updateData)
      .eq('id', memorial.id)

    if (updateError) {
      console.error('Update memorial error:', updateError)
      return NextResponse.json({ error: 'Failed to update memorial' }, { status: 500 })
    }

    // Log activity
    await supabase.from('activity_log').insert({
      memorial_id: memorial.id,
      activity_type: 'updated',
      details: { 
        fields: Object.keys(updateData).filter(k => k !== 'updated_at'),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Memorial updated successfully',
    })
  } catch (error) {
    console.error('Update memorial error:', error)
    return NextResponse.json(
      { error: 'Failed to update memorial' },
      { status: 500 }
    )
  }
}
