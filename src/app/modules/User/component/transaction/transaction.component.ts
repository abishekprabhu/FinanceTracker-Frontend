import { Component, OnInit } from '@angular/core';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { TransactionService } from '../../Service/Transaction/transaction.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CategoryService } from '../../Service/Category/category.service';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { TransactionDTO } from '../../../../model/Transaction/transaction-dto';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent implements OnInit{

  listOfTransaction:any[]=[
    "INCOME",
    "EXPENSE"
  ];
  categories : CategoryDTO[] = [];
  transactions : any;
  constructor(private fb : FormBuilder,
    private transactionService : TransactionService,
    private categoryService:CategoryService,
    private message : NzMessageService,
    private router : Router
  ) { }

  ngOnInit(): void {
    this.getCategories(); 
    this.getAllTransaction();
  }
  
  user = StorageService.getUser();

  transactionForm = this.fb.group({      
    amount: this.fb.control('',Validators.required),
    description: this.fb.control('',Validators.required),
    date: this.fb.control('',Validators.required),
    type: this.fb.control('',Validators.required),
    categoryId: this.fb.control('',Validators.required),
    userId:this.user.id     
  });

  submitForm(){
    console.log(this.transactionForm.value);
    this.transactionService.postTransaction(this.transactionForm.value).subscribe(
      {
        next:(v)=>{
          this.message.success("transaction Created.",{nzDuration:5000});
          this.getAllTransaction();
        },
        error:(e)=> this.message.error(`Something went wrong ${e.message}`, {nzDuration:5000})
      });
  }

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Fetch transaction only after categories are loaded
        // this.getAllTransaction();
      },
      error: (err) => this.message.error(`Error Fetching Categories ${err.message}`, { nzDuration: 5000 })
    });
  }

  getAllTransaction(): void {
    this.transactionService.getAllTransactionByUserId(this.user.id).subscribe({
      next: (transactions) => {
        // Map transactions to include category name instead of categoryId
        this.transactions = transactions.map((transaction: TransactionDTO) => {
          const category = this.categories.find(cat => cat.id === transaction.categoryId);
          return {
            ...transaction, 
            categoryName: category ? category.name : 'Unknown'
          };
        });
        console.log(this.transactions); // Check the modified transaction objects
      },
      error: (e) => this.message.error("Error Fetching transaction." + e, { nzDuration: 5000 })
    });
  }

  deleteTransaction(id:number){
    console.log(id);
    this.transactionService.DeleteTransaction(id).subscribe({
      next:()=> this.message.success("Transaction deleted Successfully",{nzDuration:5000}),
      error:()=>this.message.error("Error while deleteing Transaction.",{nzDuration:5000}),
      complete:()=> this.getAllTransaction()                
    })
  }

}
