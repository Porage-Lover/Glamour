import { NextResponse } from 'next/server';
import { query } from '@server/db';
import { sendPasswordResetEmail } from '../../../../../lib/emailer';
import { SignJWT } from 'jose';

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const rows = await query('SELECT * FROM customers WHERE email = ?', [email]);
    if (rows.length === 0) {
      // Return 200 even if not found to prevent email enumeration
      return NextResponse.json({ message: 'If an account with that email exists, we have sent a reset link.' });
    }

    const customer = rows[0];

    // Create a 15-minute token combining JWT_SECRET + the current password hash.
    // If the password hash changes, the token is instantly invalidated.
    const secret = new TextEncoder().encode((process.env.JWT_SECRET || 'fallback_secret') + customer.password_hash);
    const token = await new SignJWT({ id: customer.id, email: customer.email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(secret);

    const emailResult = await sendPasswordResetEmail(email, token);

    return NextResponse.json({ 
      message: 'If an account with that email exists, we have sent a reset link.',
      testUrl: emailResult.testUrl 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
