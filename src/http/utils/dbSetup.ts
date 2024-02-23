import pool from "../lib/pg";

async function dbSetup() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tb_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        full_name VARCHAR(150) NOT NULL,
        password_hash VARCHAR NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export default dbSetup;
