import { NextResponse } from 'next/server';
import { query } from '@server/db';

export async function GET() {
  try {
    const suppliers = await query('SELECT * FROM suppliers ORDER BY name ASC', []);
    return NextResponse.json({ suppliers });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
