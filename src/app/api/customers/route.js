import { NextResponse } from 'next/server';
import { query } from '@server/db';

export async function GET() {
  try {
    const customers = await query('SELECT * FROM customers ORDER BY created_at DESC', []);
    return NextResponse.json({ customers });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, phone, address } = body;

    if (email) {
      const existing = await query('SELECT id FROM customers WHERE email = ?', [email]);
      if (existing.length > 0) {
        // Customer already exists, return their ID for order linkage
        return NextResponse.json({ id: existing[0].id, message: 'Existing customer identified' }, { status: 200 });
      }
    }

    const id = 'cust-' + Date.now();
    await query(
      'INSERT INTO customers (id, name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [id, name, email || null, phone || null, address || null]
    );
    return NextResponse.json({ id, message: 'Customer created' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
