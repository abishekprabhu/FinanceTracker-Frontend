import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { CategoryService } from '../../Service/Category/category.service';
import { ExpenseService } from '../../Service/Expense/expense.service';
import { ExpenseDTO } from '../../../../model/Expense/expense-dto';

@Component({
  selector: 'app-expense-update',
  templateUrl: './expense-update.component.html',
  styleUrl: './expense-update.component.css',
})
export class ExpenseUpdateComponent implements OnInit {
  id: number = this.activatedRoute.snapshot.params['id'];
  user = StorageService.getUser();
  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private expenseService: ExpenseService,
    private message: NzMessageService,
    private router: Router
  ) {}

  expenseUpdateForm: any = this.fb.group({
    amount: this.fb.control('', Validators.required),
    description: this.fb.control('', Validators.required),
    date: this.fb.control(null, Validators.required),
    categoryId: this.fb.control('', Validators.required),
    userId: this.user.id,
  });

  ngOnInit(): void {
    this.getExpenseById();
    this.getCategories();
    console.log(this.user);
    console.log('update ID : ' + this.id);
  }

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;

        // Fetch expenses only after categories are loaded
        // this.getexpenseById();
      },
      error: (err) =>
        this.message.error(`Error Fetching Categories ${err.message}`, {
          nzDuration: 5000,
        }),
    });
  }

  getExpenseById(): void {
    console.log(this.user);
    this.expenseService.getExpenseById(this.id).subscribe({
      next: (expense) => {
        // Find the category by id and set categoryName
        const category = this.categories.find(
          (cat) => cat.id === expense.categoryId
        );
        expense.categoryName = category ? category.name : 'Unknown';

        // Log for debugging
        console.log(expense);

        // Update form values
        this.expenseUpdateForm.patchValue({
          ...expense,
          date: new Date(expense.date), // Format date if necessary
          categoryId: expense.categoryId, // Keep categoryId for selection
        });
      },
      error: () =>
        this.message.error('Error while Fetching expense.', {
          nzDuration: 5000,
        }),
    });
  }

  categories: CategoryDTO[] = [];

  // expenses:any;
  expenses: ExpenseDTO[] = [];

  updateExpense() {
    // const updateexpenseDTO: expense = {
    //   ...this.expenseForm.value
    // }
    this.expenseService
      .updateExpense(this.id, this.expenseUpdateForm.value)
      .subscribe({
        next: (v) => {
          this.message.success('Updated Successfull.', { nzDuration: 5000 });
          console.log(v);
          this.router.navigateByUrl('/user/expense');
        },
        error: (err) =>
          this.message.error(`Error Updating expense ${err.message}`, {
            nzDuration: 5000,
          }),
      });
  }
}
