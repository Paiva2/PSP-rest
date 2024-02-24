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

export interface IWalletModel {
  id: string;
  available: number;
  waiting_funds: number;
  created_at: Date;
  updated_at: Date;
  wallet_owner: string;
}

export interface IWallet {
  id: string;
  available: number;
  waitingFunds: number;
  createdAt: Date;
  updatedAt: Date;
  walletOwner: string;
}
