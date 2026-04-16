import { NextResponse } from 'next/server';
import { query } from '@server/db';
import bcrypt from 'bcryptjs';
import { jwtVerify, decodeJwt } from 'jose';

export async function POST(req) {
  try {
    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Decode the token payload blindly to extract what email address it belongs to.
    // We haven't verified the signature yet, so we don't trust it fully.
    let unverifiedPayload;
    try {
      unverifiedPayload = decodeJwt(token);
    } catch(e) {
      return NextResponse.json({ error: 'Malformed token' }, { status: 400 });
    }

    const email = unverifiedPayload.email;
    const rows = await query('SELECT * FROM customers WHERE email = ?', [email]);
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const customer = rows[0];
    const secret = new TextEncoder().encode((process.env.JWT_SECRET || 'fallback_secret') + customer.password_hash);

    try {
      // Verify token
      const { payload } = await jwtVerify(token, secret);
      if (payload.id !== customer.id) {
        throw new Error('Token does not match user');
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    // Token is valid! Update password.
    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE customers SET password_hash = ? WHERE id = ?', [newHash, customer.id]);

    return NextResponse.json({ message: 'Password has been successfully reset.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
