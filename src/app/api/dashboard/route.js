import { NextResponse } from 'next/server';
import { query, queryRaw } from '@server/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req) {
  const auth = await verifyAdmin(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    // Total revenue
    const [{ total_revenue }] = await query('SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status = ?', ['completed']);

    // Total orders
    const [{ total_orders }] = await query('SELECT COUNT(*) as total_orders FROM orders', []);

    // Total customers
    const [{ total_customers }] = await query('SELECT COUNT(*) as total_customers FROM customers', []);

    // Total products
    const [{ total_products }] = await query('SELECT COUNT(*) as total_products FROM products', []);

    // Low stock items (from view)
    let lowStock = [];
    try {
      lowStock = await queryRaw('SELECT * FROM Low_Stock_Alert');
    } catch (e) {
      // View may not exist yet
    }

    // Staff performance (from view)
    let staffPerformance = [];
    try {
      staffPerformance = await queryRaw('SELECT * FROM Staff_Sales_Performance');
    } catch (e) {}

    // Recent orders
    const recentOrders = await query(`
      SELECT o.*, c.name as customer_name
      FROM orders o LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC LIMIT 10
    `, []);

    // Pending orders count
    const [{ pending_orders }] = await query('SELECT COUNT(*) as pending_orders FROM orders WHERE status = ?', ['pending']);

    return NextResponse.json({
      stats: {
        total_revenue: parseFloat(total_revenue),
        total_orders: parseInt(total_orders),
        total_customers: parseInt(total_customers),
        total_products: parseInt(total_products),
        pending_orders: parseInt(pending_orders),
      },
      lowStock,
      staffPerformance,
      recentOrders,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
