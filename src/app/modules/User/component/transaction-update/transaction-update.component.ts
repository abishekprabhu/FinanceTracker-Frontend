import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { CategoryService } from '../../Service/Category/category.service';
import { TransactionService } from '../../Service/Transaction/transaction.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { TransactionDTO } from '../../../../model/Transaction/transaction-dto';

@Component({
  selector: 'app-transaction-update',
  templateUrl: './transaction-update.component.html',
  styleUrl: './transaction-update.component.css'
})
export class TransactionUpdateComponent implements  OnInit{

  id:number = this.activatedRoute.snapshot.params['id'];
  listOfTransaction:any[]=[
    "INCOME",
    "EXPENSE"
  ];
  categories : CategoryDTO[] = [];
  transactions : any;
  user = StorageService.getUser();
  constructor(
    private activatedRoute : ActivatedRoute,
    private fb : FormBuilder,
    private transactionService : TransactionService,
    private categoryService:CategoryService,
    private message : NzMessageService,
    private router : Router
  ) { }

  ngOnInit(): void {
    this.getCategories(); 
    this.getTransactionById();
  }

  transactionUpdateForm = this.fb.group({      
    amount: this.fb.control('',Validators.required),
    description: this.fb.control('',Validators.required),
    date: this.fb.control('',Validators.required),
    type: this.fb.control('',Validators.required),
    categoryId: this.fb.control('',Validators.required),
    userId:this.user.id     
  });

getCategories(): void {
  this.categoryService.getAllCategories().subscribe({
    next: (categories) => {
      this.categories = categories;
    },
    error: (err) => this.message.error(`Error Fetching Categories ${err.message}`, { nzDuration: 5000 })
  });
}

getTransactionById():void{
  console.log(this.user);
  this.transactionService.getTransactionById(this.id).subscribe({
    next: (transaction: any) => {
      // Find the category by id and set categoryName
      const category = this.categories.find(cat => cat.id === transaction.categoryId);
      transaction.categoryName = category ? category.name : 'Unknown';
      
      // Log for debugging
      console.log(transaction);

      // Update form values
      this.transactionUpdateForm.patchValue({
        ...transaction,
        date: new Date(transaction.date), // Format date if necessary
        categoryId: transaction.categoryId // Keep categoryId for selection
      });
    },
    error:(err)=> this.message.error(`Error while Fetching transaction.${err.message}` , {nzDuration:5000})
  })
}

updateTransaction(){
  this.transactionService.updateTransaction(this.id,this.transactionUpdateForm.value).subscribe({
    next:(v)=>{this.message.success("Updated Successfully",{nzDuration:5000});
    console.log(v);
    this.router.navigateByUrl("/user/transaction");
  },      
    error:(err)=>this.message.error(`Error Updating Transaction ${err.message}` ,{nzDuration:5000})
  })
}

}
