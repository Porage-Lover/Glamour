import { NextResponse } from 'next/server';
import { query } from '@server/db'; // Make sure path connects correctly to db

export async function GET() {
  try {
    const mappings = [
      { id: 'prod-1', file: 'prod-12.jpg' }, // Lakme
      { id: 'prod-2', file: 'prod-11.jpg' }, // Maybelline
      { id: 'prod-3', file: 'prod-6.jpg' },  // Neutrogena
      { id: 'prod-4', file: 'prod-2.jpg' },  // Clinique
      { id: 'prod-5', file: 'prod-1.jpg' },  // Olay
      { id: 'prod-6', file: 'prod-15.jpg' }, // Bath & Body Works
      { id: 'prod-7', file: 'prod-7.jpg' },  // MAC
      { id: 'prod-8', file: 'prod-8.jpg' },  // Tresemme
      { id: 'prod-9', file: 'prod-14.jpg' }, // OPI
      { id: 'prod-10', file: 'prod-9.jpg' }, // Vaseline
      { id: 'prod-11', file: 'prod-13.jpg' },// Midnight Rose
      { id: 'prod-12', file: 'prod-5.jpg' }, // Urban Decay
      { id: 'prod-13', file: 'prod-17.jpg' },// La Roche-Posay
      { id: 'prod-14', file: 'prod-18.jpg' },// Pantene
      { id: 'prod-15', file: 'prod-10.jpg' },// NYX
      { id: 'prod-16', file: 'prod-3.jpg' }, // Cetaphil
      { id: 'prod-17', file: 'prod-16.jpg' },// ELF
      { id: 'prod-18', file: 'prod-4.jpg' }  // Parachute
    ];

    for (const mapping of mappings) {
      await query('UPDATE products SET image_url = ? WHERE id = ?', [`/images/products/${mapping.file}`, mapping.id]);
    }

    return NextResponse.json({ success: true, message: 'Database seamlessly updated!' });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: e.message });
  }
}
