export interface TransactionDTO {
  id: number;
  description: string;
  amount: number;
  type: string;
  date: Date;
  userId: number;
  categoryId: number;
  incomeId: number;
  expenseId: number;
  categoryName: string;
  [key: string]: any; // Index signature
}
