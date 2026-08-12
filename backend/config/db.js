import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  // 🔑 Keep the TCP socket alive so Render's network / your DB host
  // doesn't silently kill idle connections
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // start sending keep-alive packets after 10s idle

  // 🔑 Proactively recycle connections that sit unused too long,
  // instead of letting the DB host kill them first (requires mysql2 >= 3.9)
  idleTimeout: 60000,   // close idle connections after 60s
  maxIdle: 10,          // max idle connections kept in pool
});

// Optional but recommended: catch pool-level errors so they don't
// crash the whole Node process
db.on("error", (err) => {
  console.error("MySQL Pool Error:", err.code, err.message);
});