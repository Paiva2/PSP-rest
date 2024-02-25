import pool from "../lib/pg";

async function dbSetup() {
  const { rows: tablesExists } = await pool.query(`
  SELECT EXISTS(
    SELECT * 
    FROM information_schema.tables 
    WHERE 
      table_schema = 'public' AND 
      table_name = 'tb_payables'
    );
  `);

  if (!tablesExists[0].exists) {
    await pool.query(`
    DROP TYPE IF EXISTS PAYMENT_METHOD CASCADE;
    CREATE TYPE PAYMENT_METHOD AS ENUM ('debit_card', 'credit_card');

    DROP TYPE IF EXISTS PAYABLE_STATUS CASCADE;
    CREATE TYPE PAYABLE_STATUS AS ENUM ('paid', 'waiting_funds');

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
      available NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      wallet_owner UUID NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tb_transactions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      value NUMERIC(12,2) NOT NULL DEFAULT 0,
      method PAYMENT_METHOD NOT NULL,
      card_number VARCHAR(20) NOT NULL,
      card_validation_date VARCHAR(7) NOT NULL,
      card_cvv DECIMAL NOT NULL,
      description VARCHAR(500) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      payer_id UUID NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE,
      receiver_id UUID NOT NULL REFERENCES tb_users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tb_payables (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      status PAYABLE_STATUS NOT NULL,
      value NUMERIC(12,2) NOT NULL DEFAULT 0,
      fee NUMERIC(12,2) NOT NULL,
      payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

      transaction_id UUID NOT NULL REFERENCES tb_transactions(id) ON DELETE CASCADE
    );
  `);
  }
}

export default dbSetup;
