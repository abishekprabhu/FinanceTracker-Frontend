import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { IncomeService } from '../../Service/Income/income.service';
import { IncomeDTO } from '../../../../model/Income/income-dto';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { CategoryService } from '../../Service/Category/category.service';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { StatsService } from '../../Service/Stats/stats.service';
@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrl: './income.component.css'
})
export class IncomeComponent {


categories : CategoryDTO[] = [];
    
  incomes: IncomeDTO[] = [];
  // incomes: IncomeDTO[] = [];
  // incomes : any;
  constructor(private fb : FormBuilder,
    private incomeService : IncomeService,
    private categoryService:CategoryService,
    private message : NzMessageService,
    private router : Router,
    private statsService : StatsService
  ) { }

   user = StorageService.getUser();

    ngOnInit(){   
      this.getCategories(); 
      this.getBarData();
      this.getlineData();
      // if (!this.user || !this.user.id) {
      //   this.message.error("User not logged in or missing user ID.", { nzDuration: 5000 });
      //   return; // Stop further execution if user or id is missing
      // }
      // console.log(this.getCategories());
      // console.log(this.incomeForm);
      // console.log(this.getAllincome());
    }

    incomeForm = this.fb.group({      
      amount: this.fb.control('',Validators.required),
      description: this.fb.control('',Validators.required),
      date: this.fb.control('',Validators.required),
      categoryId: this.fb.control('',Validators.required),
      userId:this.user.id     
  });

    // id!:number;
    getCategories(): void {
      this.categoryService.getAllCategories().subscribe({
        next: (categories) => {
          this.categories = categories;
          // Fetch incomes only after categories are loaded
          this.getAllIncome();
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
      console.log(this.incomeForm.value);
      this.incomeService.postIncome(this.incomeForm.value).subscribe(
        {
          next:(v)=>{
            this.message.success("Income Created.",{nzDuration:5000});
            this.getAllIncome();
          },
          error:(e)=> this.message.error(`Something went wrong ${e.message}`, {nzDuration:5000})
        });
    }

    getAllIncome(): void {
      this.incomeService.getAllExpenseByUserId(this.user.id).subscribe({
        next: (incomes) => {
          // Map incomes to include category name instead of categoryId
          this.incomes = incomes.map((income: IncomeDTO) => {
            const category = this.categories.find(cat => cat.id === income.categoryId);
            return {
              ...income,
              categoryName: category ? category.name : 'Unknown'
            };
          });
          console.log(this.incomes); // Check the modified income objects
        },
        error: (e) => this.message.error("Error Fetching income." + e, { nzDuration: 5000 })
      });
    }
    

    deleteIncome(id:number){
      console.log(id);
      this.incomeService.DeleteIncome(id).subscribe({
        next:()=> this.message.success("Income deleted Successfully",{nzDuration:5000}),
        error:()=>this.message.error("Error while deleteing income.",{nzDuration:5000}),
        complete:()=> this.getAllIncome()                
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
    { data: [], label: 'Income' },
    // { data: [], label: 'Expense' }
  ];
  private monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  getBarData() {
    this.statsService.getMonthlyData().subscribe(data => {
      const incomeData = data.incomeData; 
      this.barChartLabels = Object.keys(incomeData).map(month => this.monthNames[+month]);
      this.barChartData[0].data = Object.values(data.incomeData);
      // this.barChartData[1].data = Object.values(data.expenseData);
    });
  }


    // line chart data
    public lineChartOptions = {
      responsive: true,
      maintainAspectRatio: false
      };
  
      lineChartType: ChartType = 'line';
      public lineChartLegend = true;
      public lineChartLabels: string[] = [];
      public lineChartData: any[] = [
        { data: [], label: 'Income' ,  borderWidth: 1,
          backgroundColor: 'rgba(80, 200, 120, 0.2)',
          borderColor: 'rgb(0, 100, 0)',
          fill: true,}
      ];

      getlineData() {
        this.statsService.getChartMonthly().subscribe(data => {
          const incomeData = data.incomeList; // Ensure this is an array
          // const expenseData = data.expenseList; // Ensure this is an array
      
          // Map month numbers to month names
          this.lineChartLabels = incomeData.map((income: any) => {
            const date = new Date(income.date);
            return isNaN(date.getTime()) ? income.date : date.toLocaleDateString();
          });
      
          // Populate the data arrays for both income and expenses
          this.lineChartData[0].data = incomeData.map((income: any) => income.amount);
          // this.lineChartData[1].data = expenseData.map((expense: any) => expense.amount);
      
          // Log data for debugging
          console.log('Line Chart Labels:', this.lineChartLabels);
          console.log('Income Data:', this.lineChartData[0].data);
          // console.log('Expense Data:', this.lineChartData[1].data);
          console.log('Combined Data:', this.lineChartData);
          console.log('Combined Labels:', this.lineChartLabels);

        });
      }

}
