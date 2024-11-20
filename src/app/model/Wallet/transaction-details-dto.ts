export interface TransactionDetailsDTO {
  id: number;
  paymentMethod: string;
  paymentId: string;
  receipt: string;
  amount: number;
  walletId: number;
  transactionDate: string;
}
