export interface IUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreation {
  email: string;
  password: string;
  fullName: string;
}
