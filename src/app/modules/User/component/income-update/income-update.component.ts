import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { IncomeService } from '../../Service/Income/income.service';
import { CategoryService } from '../../Service/Category/category.service';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { IncomeDTO } from '../../../../model/Income/income-dto';
import { StorageService } from '../../../../auth/services/storage/storage.service';

@Component({
  selector: 'app-income-update',
  templateUrl: './income-update.component.html',
  styleUrl: './income-update.component.css'
})
export class IncomeUpdateComponent implements OnInit{

  id:number = this.activatedRoute.snapshot.params['id'];
  user = StorageService.getUser();
  categories : CategoryDTO[] = [];
    
  // incomes:any;
  incomes: IncomeDTO[] = [];
  constructor(
    private activatedRoute : ActivatedRoute,
    private fb : FormBuilder,
    private categoryService : CategoryService,
    private incomeService : IncomeService,
    private message : NzMessageService,
    private router : Router,
  ) { }

  incomeUpdateForm:any = this.fb.group({      
    amount: this.fb.control('',Validators.required),
    description: this.fb.control('',Validators.required),
    date: this.fb.control(null,Validators.required),
    categoryId: this.fb.control('',Validators.required),
    userId:this.user.id     
});

  ngOnInit(): void {
    this.getIncomeById();
    this.getCategories();
    console.log(this.user);
    console.log("update ID : "+this.id);
  }

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;

        // Fetch incomes only after categories are loaded
        // this.getIncomeById();
      },
      error: (err) => this.message.error(`Error Fetching Categories ${err.message}`, { nzDuration: 5000 })
    });
  }

  getIncomeById():void{
    console.log(this.user);
    this.incomeService.getIncomeById(this.id).subscribe({
      next: (income: any) => {
        // Find the category by id and set categoryName
        const category = this.categories.find(cat => cat.id === income.categoryId);
        income.categoryName = category ? category.name : 'Unknown';
        
        // Log for debugging
        console.log(income);
  
        // Update form values
        this.incomeUpdateForm.patchValue({
          ...income,
          date: new Date(income.date), // Format date if necessary
          categoryId: income.categoryId // Keep categoryId for selection
        });
      },
      error:()=> this.message.error("Error while Fetching Income." , {nzDuration:5000})
    })
  }

  updateIncome(){
    this.incomeService.updateIncome(this.id,this.incomeUpdateForm.value).subscribe({
      next:(v)=>{this.message.success("Updated Successfully",{nzDuration:5000});
      console.log(v);
      this.router.navigateByUrl("/user/income");
    },      
      error:(err)=>this.message.error(`Error Updating Income ${err.message}` ,{nzDuration:5000})
    })
  }

}
