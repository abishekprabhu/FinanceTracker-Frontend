export interface TransactionDTO {
    map(arg0: (income: TransactionDTO) => { categoryName: string; id: number; description: string; categoryId: number; type: string; date: Date; amount: number; userId: number; incomeId:number; expenseId:number}): any;
    id:number;
    description:string;
    amount:number;
    type:string;
    date:Date;
    userId:number;
    categoryId:number;
    incomeId:number;
    expenseId:number;

}
