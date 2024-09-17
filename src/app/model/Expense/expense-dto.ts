export interface ExpenseDTO {

    map(arg0: (expense: ExpenseDTO) => { categoryName: string; id: number; description: string; categoryId: number; date: Date; amount: number; userId: number; }): any;
    id:number;
    description:string;
    categoryId:number;
    date:Date;
    amount:number;
    userId:number;
}
