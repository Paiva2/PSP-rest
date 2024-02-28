import { IUser, IUserCreation } from "../@types/types";
import { UserRepository } from "../repositories/userRepository";
import formatBrl from "../utils/formatBrl";
import pool from "../lib/pg";
import Big from "big.js";

export default class UserModel implements UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    const { rows } = await pool.query(
      `
      SELECT
          usr.id, 
          usr.email, 
          usr.full_name, 
          usr.password_hash, 
          usr.created_at, 
          usr.updated_at,
          wall.id AS wallet_id,
          wall.available,
          wall.updated_at AS wallet_updated_at,
          wall.created_at AS wallet_created_at,
          wall.wallet_owner
        FROM tb_users usr 
        LEFT JOIN tb_wallets wall 
        ON wall.wallet_owner = usr.id 
        WHERE usr.email = $1;
      `,
      [email]
    );

    if (!rows.length) return null;

    const find = rows[0];

    const userDtoResponse: IUser = {
      id: find.id,
      email: find.email,
      fullName: find.full_name,
      passwordHash: find.password_hash,
      createdAt: find.created_at,
      updatedAt: find.updated_at,
      wallet: {
        id: find.wallet_id,
        available: find.available,
        createdAt: find.wallet_created_at,
        updatedAt: find.wallet_updated_at,
        walletOwner: find.wallet_owner,
      },
    };

    return userDtoResponse;
  }

  async save(newUser: IUserCreation): Promise<IUser> {
    const { rows } = await pool.query(
      "INSERT INTO tb_users (email, full_name, password_hash) VALUES($1, $2, $3) RETURNING *",
      [newUser.email, newUser.fullName, newUser.password]
    );

    const creation: IUser = rows[0];

    return creation;
  }

  async findById(id: string): Promise<IUser | null> {
    const { rows } = await pool.query(
      ` 
      SELECT 
        usr.id, 
        usr.email, 
        usr.full_name, 
        usr.password_hash, 
        usr.created_at, 
        usr.updated_at,
        wall.id AS wallet_id,
        wall.available,
        wall.updated_at AS wallet_updated_at,
        wall.created_at AS wallet_created_at,
        wall.wallet_owner
      FROM tb_users usr 
      LEFT JOIN tb_wallets wall ON wall.wallet_owner = usr.id 
      WHERE usr.id = $1;
      `,
      [id]
    );

    if (!rows.length) return null;

    const find = rows[0];

    const userDtoResponse: IUser = {
      id: find.id,
      email: find.email,
      fullName: find.full_name,
      passwordHash: find.password_hash,
      createdAt: find.created_at,
      updatedAt: find.updated_at,
      wallet: {
        id: find.wallet_id,
        available: find.available,
        createdAt: find.wallet_created_at,
        updatedAt: find.wallet_updated_at,
        walletOwner: find.wallet_owner,
      },
    };

    return userDtoResponse;
  }
}
