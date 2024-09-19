import { Component } from '@angular/core';
import { ExpenseService } from '../../Service/Expense/expense.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { IncomeDTO } from '../../../../model/Income/income-dto';
import { CategoryService } from '../../Service/Category/category.service';
import { ExpenseDTO } from '../../../../model/Expense/expense-dto';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css'
})
export class ExpenseComponent {
  categories : CategoryDTO[] = [];
    
  expenses : ExpenseDTO[] = [];
  // expenses: IncomeDTO[] = [];
  // expenses : any;
  constructor(private fb : FormBuilder,
    private expenseService : ExpenseService,
    private categoryService:CategoryService,
    private message : NzMessageService,
    private router : Router
  ) { }

   user = StorageService.getUser();

    ngOnInit(){   
      this.getCategories(); 
      this.user;
      // console.log(this.getCategories());
      // console.log(this.expenseForm);
      // console.log(this.getAllExpense());
    }

    expenseForm = this.fb.group({      
      amount: this.fb.control('',Validators.required),
      description: this.fb.control('',Validators.required),
      date: this.fb.control('',Validators.required),
      categoryId: this.fb.control('',Validators.required),
      userId:this.user.id     
  });

    id!:number;
    getCategories(): void {
      this.categoryService.getAllCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
          // Fetch expenses only after categories are loaded
          this.getAllExpense();
        },
        error: (err) => this.message.error(`Error Fetching Categories ${err.message}`, { nzDuration: 5000 })
      });
    }

    // getCategoryById(){
    //   console.log("id"+this.id);
    //   this.categoryService.getCategoryById(this.id).subscribe({
    //     next:(v) => this.categoryValue.patchValue(v),
    //     error:(err)=> this.message.error(`Something Went Wrong ${err.message}`,{nzDuration:5000})
    //   });
    // }

    submitForm(){
      console.log(this.expenseForm.value);
      this.expenseService.postExpense(this.expenseForm.value).subscribe(
        {
          next:(v)=>{
            this.message.success("Income Created.",{nzDuration:5000});
            this.getAllExpense();
          },
          error:(e)=> this.message.error(`Something went wrong ${e.message}`, {nzDuration:5000})
        });
    }

    getAllExpense(): void {
      this.expenseService.getAllExpenseByUserId(this.user.id).subscribe({
        next: (expenses) => {
          // Map expenses to include category name instead of categoryId
          this.expenses = expenses.map((income: IncomeDTO) => {
            const category = this.categories.find(cat => cat.id === income.categoryId);
            return {
              ...income,
              categoryName: category ? category.name : 'Unknown'
            };
          });
          console.log(this.expenses); // Check the modified income objects
        },
        error: (e) => this.message.error("Error Fetching income." + e, { nzDuration: 5000 })
      });
    }
    

    deleteExpense(id:number){
      this.expenseService.DeleteExpense(id).subscribe({
        next:()=> this.message.success("Expense deleted Successfully",{nzDuration:5000}),
        error:()=>this.message.error("Error while deleteing income.",{nzDuration:5000}),
        complete:()=> this.getAllExpense()                
      })
    }
}
