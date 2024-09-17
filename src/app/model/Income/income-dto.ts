import { CategoryDTO } from "../Category/category-dto";
import { UserDTO } from "../User-Model/user-dto";

export interface IncomeDTO {
    map(arg0: (income: IncomeDTO) => { categoryName: string; id: number; description: string; categoryId: number; date: Date; amount: number; userId: number; }): any;
    id:number;
    description:string;
    categoryId:number;
    date:Date;
    amount:number;
    userId:number;
}
