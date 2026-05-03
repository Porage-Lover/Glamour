import { NextResponse } from 'next/server';
import { query } from '@server/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const products = await query('SELECT p.*, s.name as supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.id = ?', [id]);
    if (products.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ product: products[0] });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const auth = await verifyAdmin(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, brand, category, price, stock_quantity, description } = body;
    await query(
      'UPDATE products SET name=?, brand=?, category=?, price=?, stock_quantity=?, description=? WHERE id=?',
      [name, brand, category, price, stock_quantity, description, id]
    );
    return NextResponse.json({ message: 'Product updated' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const auth = await verifyAdmin(req);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await params;
    await query('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
