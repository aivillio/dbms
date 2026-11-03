import mysql from 'mysql2/promise';

declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

const pool =
  global._mysqlPool ||
  mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'smart_campus',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

if (process.env.NODE_ENV !== 'production') {
  global._mysqlPool = pool;
}

export default pool;
