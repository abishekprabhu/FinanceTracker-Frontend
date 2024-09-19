import { Component } from '@angular/core';
import { BudgetService } from '../../Service/Budget/budget.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { CategoryService } from '../../Service/Category/category.service';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { BudgetDTO } from '../../../../model/Budget/budget-dto';

@Component({
  selector: 'app-budget-update',
  templateUrl: './budget-update.component.html',
  styleUrl: './budget-update.component.css'
})
export class BudgetUpdateComponent {
  id:number = this.activatedRoute.snapshot.params['id'];
  categories: CategoryDTO [] = [];
  user = StorageService.getUser();
  budgets: BudgetDTO[] = [];
  constructor(
    private activatedRoute : ActivatedRoute,
    private fb : FormBuilder,
    private categoryService : CategoryService,
    private budgetService : BudgetService,
    private message : NzMessageService,
    private router : Router,
  ) { }

  budgetForm = this.fb.group({
    amount: this.fb.control('', [Validators.required, Validators.min(1)]),
    startDate:this.fb.control('',Validators.required),
    endDate:this.fb.control('',Validators.required),
    categoryId: this.fb.control('',Validators.required),
    userId: [this.user.id, Validators.required]
  });

  ngOnInit(): void {
    this.getBudgetById();
    this.getCategories();

  }

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => this.message.error(`Error Fetching Categories ${err.message}`, { nzDuration: 5000 })
    });
  }

  getBudgetById():void{
    console.log("id : " + this.id);
    console.log(this.user);
    this.budgetService.getBudgetById(this.id).subscribe({
      next: (budget: any) => {
        // Find the category by id and set categoryName
        const category = this.categories.find(cat => cat.id === budget.categoryId);
        budget.categoryName = category ? category.name : 'Unknown';
        
        // Log for debugging
        console.log(budget);
  
        // Update form values
        this.budgetForm.patchValue({
          ...budget,
          date: new Date(budget.date), // Format date if necessary
          categoryId: budget.categoryId // Keep categoryId for selection
        });
      },
      error:(error)=> this.message.error(`Error while Fetching expense. ${error.message}` , {nzDuration:5000})
    })
  }

  onSubmit(){
    this.budgetService.updateBudget(this.id,this.budgetForm.value).subscribe({
      next:(v)=>{this.message.success("Updated Successfull.",{nzDuration:5000});
      console.log(v);
      this.router.navigateByUrl("/user/budget");
    },      
      error:(err)=>this.message.error(`Error Updating Budget ${err.message}` ,{nzDuration:5000})
    })
  }


}
