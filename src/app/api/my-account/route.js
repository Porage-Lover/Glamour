import { NextResponse } from 'next/server';
import { query } from '@server/db';
import * as jose from 'jose';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-dev');
    
    let payload;
    try {
      const { payload: jwtPayload } = await jose.jwtVerify(token, secret);
      payload = jwtPayload;
    } catch (e) {
      return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    // Now query user details and orders
    const userResult = await query('SELECT id, name, email, phone, address FROM customers WHERE id = ?', [payload.id]);
    if (!userResult.length) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    const user = userResult[0];

    const orders = await query(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
             (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as num_items
      FROM orders o
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
    `, [payload.id]);

    return NextResponse.json({
      user,
      orders
    });
  } catch (err) {
    console.error('MyAccount API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
