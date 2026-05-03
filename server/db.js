import mysql from 'mysql2/promise';

const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cosmetic_shop',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONN_LIMIT || '3'),
  queueLimit: 0,
  charset: 'utf8mb4',
};

let pool;

if (process.env.NODE_ENV === 'production') {
  pool = mysql.createPool(poolConfig);
} else {
  if (!globalThis.__mysqlPool) {
    globalThis.__mysqlPool = mysql.createPool(poolConfig);
  }
  pool = globalThis.__mysqlPool;
}

export default pool;

export async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

export async function queryRaw(sql) {
  const [rows] = await pool.query(sql);
  return rows;
}
