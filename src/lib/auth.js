import * as jose from 'jose';
import { NextResponse } from 'next/server';

export async function verifyAdmin(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Unauthorized: Missing Token', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    
    let payload;
    try {
      const { payload: jwtPayload } = await jose.jwtVerify(token, secret);
      payload = jwtPayload;
    } catch (e) {
      return { error: 'Unauthorized: Invalid Token', status: 401 };
    }

    if (payload.role !== 'admin' && payload.role !== 'staff') {
      return { error: 'Forbidden: Insufficient Privileges', status: 403 };
    }

    return { payload };
  } catch (err) {
    console.error('Admin verification error:', err);
    return { error: 'Internal Server Error', status: 500 };
  }
}
