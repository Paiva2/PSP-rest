enum PAYMENT_METHOD {
  DEBIT = "debit_card",
  CREDIT = "credit_card",
}
enum PAYABLE_STATUS {
  PAID = "paid",
  WAITING_FUNDS = "waiting_funds",
}
export interface IUser {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  wallet?: IWallet;
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
  available: Big;
  created_at: Date;
  updated_at: Date;
  wallet_owner: string;
}

export interface IWallet {
  id: string;
  available: Big;
  createdAt: Date;
  updatedAt: Date;
  walletOwner: string;
}

export interface ITransaction {
  id?: string;
  value: Big;
  method: PAYMENT_METHOD;
  cardNumber: number;
  cardValidationDate: string;
  cardCvv: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;

  payerId: string;
  receiverId: string;
}

export interface ITransactionModel {
  id?: string;
  value: Big;
  method: PAYMENT_METHOD;
  card_number: number;
  card_validation_date: string;
  card_cvv: number;
  description: string;
  created_at?: Date;
  updated_at?: Date;

  payer_id: string;
  receiver_id: string;
}

export interface IPayable {
  id: string;
  status: PAYABLE_STATUS;
  value: Big;
  fee: Big;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;

  transactionId: string;
}

export interface IPayableModel {
  id: string;
  status: PAYABLE_STATUS;
  value: Big;
  fee: Big;
  payment_date: Date;
  created_at: Date;
  updated_at: Date;

  transaction_id: string;
}

export interface IPayableCreation {
  transactionId?: string;
  payableDate: Date;
  payableStatus: PAYABLE_STATUS;
  payableFee: Big.Big;
  payableAmount: Big.Big;
}

export interface ITransactionSave {
  transaction: ITransaction;
  payable: IPayableCreation;
}
