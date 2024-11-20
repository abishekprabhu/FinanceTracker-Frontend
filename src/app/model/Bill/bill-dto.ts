export interface BillDTO {
  id: number;
  description: string;
  amountDue: number;
  dueDate: Date;
  paid: boolean;
  userId: number;
  categoryId: number;
  walletId: number;
  categoryName: string;
}
