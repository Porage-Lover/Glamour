import { NextResponse } from 'next/server';
import { query } from '@server/db';

export async function POST(req) {
  try {
    const { orderId, email } = await req.json();

    if (!orderId || !email) {
      return NextResponse.json({ error: 'Order ID and Email are required' }, { status: 400 });
    }

    // Find the order that matches the order_number AND belongs to the customer with that email
    const orderRows = await query(`
      SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at 
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE o.order_number = ? AND c.email = ?
    `, [orderId, email]);

    if (orderRows.length === 0) {
      return NextResponse.json({ error: 'No order found with the provided details. Please check your Order ID and Email.' }, { status: 404 });
    }

    const order = orderRows[0];

    // Fetch order items
    const items = await query('SELECT product_name, quantity, unit_price FROM order_details WHERE order_id = ?', [order.id]);

    return NextResponse.json({ order, items });
  } catch (err) {
    console.error('Track order error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
