import { IUser, IUserCreation, IUserModel } from "../@types/types";
import { UserRepository } from "../repositories/userRepository";
import pool from "../lib/pg";

export default class UserModel implements UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    const { rows } = await pool.query(
      "SELECT * FROM tb_users WHERE email = $1",
      [email]
    );

    const find: IUserModel | undefined = rows[0];

    if (!find) return null;

    const userDtoResponse: IUser = {
      id: find.id,
      email: find.email,
      fullName: find.full_name,
      passwordHash: find.password_hash,
      createdAt: find.created_at,
      updatedAt: find.updated_at,
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
    const { rows } = await pool.query("SELECT * FROM tb_users WHERE id = $1", [
      id,
    ]);

    const find: IUserModel | undefined = rows[0];

    if (!find) return null;

    const userDtoResponse: IUser = {
      id: find.id,
      email: find.email,
      fullName: find.full_name,
      passwordHash: find.password_hash,
      createdAt: find.created_at,
      updatedAt: find.updated_at,
    };

    return userDtoResponse;
  }
}
