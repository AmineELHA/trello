// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  // Create response that clears the cookie
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully'
  });

  // Clear the auth token cookie
  response.cookies.delete('auth-token');

  return response;
}