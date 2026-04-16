import { NextResponse } from 'next/server';
import { query } from '@server/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const adminRows = await query(`SELECT id, username as name, email, phone, role, 'System' as type FROM profiles ORDER BY username`);
    const customerRows = await query(`SELECT id, name, email, phone, 'customer' as role, 'Customer' as type, created_at FROM customers ORDER BY created_at DESC`);
    
    // Normalize slightly for frontend consumption
    const allUsers = [
      ...adminRows.map(r => ({ ...r, date: '-' })),
      ...customerRows.map(r => ({ ...r, date: r.created_at ? new Date(r.created_at).toLocaleDateString() : '-' }))
    ];

    return NextResponse.json({ users: allUsers });
  } catch (err) {
    console.error('Error fetching users:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, email, phone, address, password, role } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const uniqueId = `uid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (role === 'customer') {
      // Check if exists
      const existing = await query('SELECT id FROM customers WHERE email = ?', [email]);
      if (existing.length > 0) return NextResponse.json({ error: 'Email already registered as customer' }, { status: 400 });

      await query(
        'INSERT INTO customers (id, name, email, phone, address, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
        [uniqueId, name, email, phone || '', address || '', passwordHash]
      );
    } else {
      // Check if exists (admin/staff)
      const existing = await query('SELECT id FROM profiles WHERE email = ?', [email]);
      if (existing.length > 0) return NextResponse.json({ error: 'Email already registered as staff/admin' }, { status: 400 });

      await query(
        'INSERT INTO profiles (id, username, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
        [uniqueId, name, email, phone || '', passwordHash, role]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error creating user:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
