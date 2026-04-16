import { NextResponse } from 'next/server';
import pool from '@server/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'name';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50') || 50, 1), 100);

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) { sql += ' AND category = ?'; params.push(category); }
    if (brand) { sql += ' AND brand = ?'; params.push(brand); }
    if (search) { sql += ' AND (name LIKE ? OR brand LIKE ? OR category LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    if (sort === 'price_asc') sql += ' ORDER BY price ASC';
    else if (sort === 'price_desc') sql += ' ORDER BY price DESC';
    else if (sort === 'newest') sql += ' ORDER BY created_at DESC';
    else sql += ' ORDER BY name ASC';

    sql += ` LIMIT ${limit}`;

    const [products] = await pool.query(sql, params);
    return NextResponse.json({ products });
  } catch (err) {
    console.error('Products API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, brand, category, price, stock_quantity, supplier_id, description, image_url } = body;
    const id = 'prod-' + Date.now();
    await pool.query(
      'INSERT INTO products (id, name, brand, category, price, stock_quantity, supplier_id, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, brand, category, price, stock_quantity || 0, supplier_id || null, description || '', image_url || '']
    );
    return NextResponse.json({ id, message: 'Product created' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
