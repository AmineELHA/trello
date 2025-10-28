// src/app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import { getGraphQLClient } from '../../../lib/graphqlClient';
import { REGISTER_USER } from '../../../graphql/mutations';

interface RegisterResult {
  signUp: {
    token: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      username: string;
    };
    errors: string[];
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, username } = body;

    const client = getGraphQLClient();
    const result = await client.request<RegisterResult>(REGISTER_USER, {
      email,
      password,
      firstName,
      lastName,
      username,
    });

    if (result.signUp.errors && result.signUp.errors.length > 0) {
      return NextResponse.json(
        { errors: result.signUp.errors },
        { status: 400 }
      );
    }

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      token: result.signUp.token,
      user: result.signUp.user
    });

    // Set the token in a cookie
    response.cookies.set('auth-token', result.signUp.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}