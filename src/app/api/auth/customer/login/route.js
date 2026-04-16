import { NextResponse } from 'next/server';
import { query } from '@server/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });

    const rows = await query('SELECT * FROM customers WHERE email = ?', [email]);
    if (rows.length === 0) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const customer = rows[0];
    const match = await bcrypt.compare(password, customer.password_hash);
    if (!match) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = await new SignJWT({ id: customer.id, role: 'customer', email: customer.email, name: customer.name })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('12h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret'));

    const { password_hash, ...userFields } = customer;
    return NextResponse.json({ token, user: userFields });
  } catch (err) {
    console.error('Customer login error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
