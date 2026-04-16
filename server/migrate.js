import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Lera@2019',
  database: 'cosmetic_shop',
  multipleStatements: true,
  charset: 'utf8mb4',
};

async function migrate() {
  const conn = await mysql.createConnection(config);
  console.log('Connected to MySQL...');

  await conn.query('ALTER TABLE customers MODIFY password_hash VARCHAR(255) NULL;');
  console.log('Altered customers table successfully!');

  await conn.end();
}

migrate().catch(console.error);
