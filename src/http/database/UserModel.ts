import { QueryResult } from "pg";
import { IUser, IUserCreation } from "../@types/types";
import pool from "../lib/pg";
import { UserRepository } from "../repositories/userRepository";

export default class UserModel implements UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    const { rows } = await pool.query(
      "SELECT * FROM tb_users WHERE email = $1",
      [email]
    );

    const find: IUser | undefined = rows[0];

    if (!find) return null;

    return find;
  }

  async save(newUser: IUserCreation): Promise<IUser> {
    const { rows } = await pool.query(
      "INSERT INTO tb_users (email, full_name, password_hash) VALUES($1, $2, $3) RETURNING *",
      [newUser.email, newUser.fullName, newUser.password]
    );

    const creation: IUser = rows[0];

    return creation;
  }
}
