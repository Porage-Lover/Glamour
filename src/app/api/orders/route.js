import { NextResponse } from 'next/server';
import { query } from '@server/db';
import { sendOrderReceiptEmail } from '../../../lib/emailer';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req) {
  const auth = await verifyAdmin(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const orders = await query(`
      SELECT o.*, c.name as customer_name
      FROM orders o LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
    `, []);
    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { customer_id, items, payment_method } = body;
    // items: [{ product_id, product_name, quantity, unit_price }]

    const orderId = 'ord-' + Date.now();
    const orderNumber = 'ORD-' + (1000 + Math.floor(Math.random() * 9000));
    const totalAmount = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    // Create order
    await query(
      'INSERT INTO orders (id, order_number, customer_id, total_amount, status, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [orderId, orderNumber, customer_id, totalAmount, 'pending', 'admin-001']
    );

    // Create order details — triggers stock deduction automatically
    for (const item of items) {
      const detailId = 'det-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
      const subtotal = item.unit_price * item.quantity;
      await query(
        'INSERT INTO order_details (id, order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [detailId, orderId, item.product_id, item.product_name, item.quantity, item.unit_price, subtotal]
      );
    }

    // Create payment — triggers auto-complete if payment_status is 'completed'
    if (payment_method) {
      const payId = 'pay-' + Date.now();
      const txnId = payment_method !== 'cash' ? 'TXN' + Date.now() : null;
      await query(
        'INSERT INTO payments (id, order_id, amount, payment_method, payment_status, transaction_id) VALUES (?, ?, ?, ?, ?, ?)',
        [payId, orderId, totalAmount, payment_method, 'completed', txnId]
      );
    }

    // Fetch customer email
    const [custRows] = await query('SELECT email FROM customers WHERE id = ?', [customer_id]);
    const email = custRows?.email;

    // Send Receipt Email
    let receiptUrl = null;
    if (email) {
      try {
        const emailResult = await sendOrderReceiptEmail(email, {
          orderNumber,
          totalAmount,
          items
        });
        receiptUrl = emailResult.testUrl;
      } catch (e) {
        console.error('Email error:', e);
      }
    }

    return NextResponse.json({ orderId, orderNumber, totalAmount, receiptUrl, message: 'Order placed successfully' }, { status: 201 });
  } catch (err) {
    // Handle SQL trigger errors (e.g. stock exceeded)
    if (err.message && err.message.includes('exceeds available stock')) {
      return NextResponse.json({ error: 'One or more items exceed available stock.' }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
