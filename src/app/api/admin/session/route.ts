import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = request.cookies.get('admin-session')?.value;
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword || session !== correctPassword) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0, // Expire immediately
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
