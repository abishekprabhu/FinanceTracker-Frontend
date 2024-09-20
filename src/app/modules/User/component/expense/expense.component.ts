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
import { StatsService } from '../../Service/Stats/stats.service';
import { ChartType } from 'chart.js';

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
    private router : Router,
    private statsService : StatsService
  ) { }

   user = StorageService.getUser();

    ngOnInit(){   
      this.getCategories(); 
      this.user;
      this.getBarData();
      this.getlineData();
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

  // Bar chart data
  public barChartOptions = {
    responsive: true,
    maintainAspectRatio: false
    };
  
    barChartType: ChartType = 'bar';
    public barChartLegend = true;
    public barChartLabels: string[] = [];
    public barChartData: any[] = [
      // { data: [], label: 'Income' },
      { data: [], label: 'Expense',      borderColor: '#FF6384',
        backgroundColor: '#FFB1C1', }
    ];
    private monthNames: string[] = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    getBarData() {
      this.statsService.getMonthlyData().subscribe(data => {
        // const incomeData = data.incomeData; // Assuming incomeData is a map
        const expenseData = data.expenseData; // Assuming expenseData is a map
  
        // Map month numbers to month names
        this.barChartLabels = Object.keys(expenseData).map(month => this.monthNames[+month]);
        // this.barChartData[0].data = Object.values(incomeData);
        this.barChartData[0].data = Object.values(expenseData);
      });
    }


    // Bar chart data
    public lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false
      };
  
      lineChartType: ChartType = 'line';
      public lineChartLegend = true;
      public lineChartLabels: string[] = [];
      public lineChartData: any[] = [
        { data: [], label: 'Expense' ,  borderWidth: 1,
          backgroundColor: 'rgba(255, 0, 0, 0.2)',
          borderColor: 'rgb(255, 0, 0)',
          fill: true, }
      ];

      getlineData() {
        this.statsService.getChartMonthly().subscribe(data => {
          // const incomeData = data.incomeList; // Ensure this is an array
          const expenseData = data.expenseList; // Ensure this is an array
      
          // Map month numbers to month names
          this.lineChartLabels = expenseData.map((income: any) => {
            const date = new Date(income.date);
            return isNaN(date.getTime()) ? income.date : date.toLocaleDateString();
          });
      
          // Populate the data arrays for both income and expenses
          // this.lineChartData[0].data = incomeData.map((income: any) => income.amount);
          this.lineChartData[0].data = expenseData.map((expense: any) => expense.amount);
      
          // Log data for debugging
          console.log('Line Chart Labels:', this.lineChartLabels);
          // console.log('Income Data:', this.lineChartData[0].data);
          console.log('Expense Data:', this.lineChartData[0].data);
          console.log('Combined Data:', this.lineChartData);
          console.log('Combined Labels:', this.lineChartLabels);

        });
      }
}
