import { NextResponse } from 'next/server';
import { query } from '@server/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const { email, password, name, phone, address } = await req.json();
    if (!email || !password || !name) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const rows = await query('SELECT * FROM customers WHERE email = ?', [email]);
    if (rows.length > 0) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const id = `cust-${uuidv4().substring(0, 8)}`;

    await query(
      'INSERT INTO customers (id, name, email, phone, address, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, phone || null, address || null, passwordHash]
    );

    const token = await new SignJWT({ id, role: 'customer', email, name })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('12h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret'));

    const userFields = { id, name, email, phone, address };
    return NextResponse.json({ token, user: userFields }, { status: 201 });
  } catch (err) {
    console.error('Customer register error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
