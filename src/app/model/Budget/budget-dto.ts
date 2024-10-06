export interface BudgetDTO {
  id: number;
  userId: number;
  categoryId: number;
  categoryName: string;
  amount: number;
  startDate: string;
  endDate: string;
  totalSpent: number;
  exceeded: boolean;
}
