import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// 创建数据库连接池
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'travel_platform',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log(`📡 Connected to MySQL database: ${process.env.DB_NAME}`);