import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req) {
  const auth = await verifyAdmin(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  
  return NextResponse.json({ valid: true, payload: auth.payload });
}
