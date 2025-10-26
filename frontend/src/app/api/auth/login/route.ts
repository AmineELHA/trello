// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { getGraphQLClient } from '../../../lib/graphqlClient';
import { LOGIN_USER } from '../../../graphql/mutations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const client = getGraphQLClient();
    const result = await client.request(LOGIN_USER, { email, password });

    if (result.login.errors.length > 0) {
      return NextResponse.json(
        { errors: result.login.errors },
        { status: 401 }
      );
    }

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      token: result.login.token
    });

    // Set the token in a cookie
    response.cookies.set('auth-token', result.login.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}