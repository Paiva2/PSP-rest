import pool from "../lib/pg";

async function dbSetup() {
  await pool.query(`
    DROP TYPE IF EXISTS PAYMENT_METHOD CASCADE;
    CREATE TYPE PAYMENT_METHOD AS ENUM ('debit_card', 'credit_card');

    CREATE TABLE IF NOT EXISTS tb_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        full_name VARCHAR(150) NOT NULL,
        password_hash VARCHAR NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tb_wallets (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      available NUMERIC(30,2) NOT NULL UNIQUE DEFAULT 0,
      waiting_funds NUMERIC(30,2) NOT NULL UNIQUE DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      wallet_owner UUID NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tb_transactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      value NUMERIC(30,2) NOT NULL UNIQUE DEFAULT 0,
      method PAYMENT_METHOD NOT NULL,
      card_number VARCHAR(20) NOT NULL,
      card_validatation_date VARCHAR(5) NOT NULL,
      card_cvv DECIMAL NOT NULL,
      description VARCHAR(500) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      transaction_owner UUID NOT NULL REFERENCES tb_users(id) ON DELETE SET NULL
    );
  `);
}

export default dbSetup;
