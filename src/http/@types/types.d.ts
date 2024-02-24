export interface IUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface IUserCreation {
  email: string;
  password: string;
  fullName: string;
}
