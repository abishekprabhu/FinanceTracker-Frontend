import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../Service/Category/category.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ChartData, ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {
  categories: CategoryDTO[] =[];
  

  constructor (private categoryService: CategoryService,
    private message : NzMessageService,
    private fb : FormBuilder,
    private router : Router
  ){}

  categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(15), Validators.minLength(3), Validators.pattern(/^[a-zA-Z ]*$/)]]
  })

  ngOnInit(): void {
    this.getCategories();
    this.loadChartData();
  }

  getCategories():void{
    this.categoryService.getAllCategories().subscribe(
      {
        next:(res) => {
          // console.log(res);
          this.categories = res;},
        error:(err) => this.message.error(`Error Fetching Categories ${err.message}`,{nzDuration:5000})
      }
    )
  }

  addCategory():void{
    this.categoryService.createCategory(this.categoryForm.value).subscribe(
      {
        next:(v)=> {
          this.message.success("New Category Added.",{nzDuration:5000}); 
          this.getCategories();
      },
        error:(err)=> this.message.error(`Something went Wrong ${err.message}`,{nzDuration:5000})
      }
    )
  }

  updateCategory(categoryId:number){
    // console.log(categoryId);
    this.router.navigateByUrl(`/user/category/${categoryId}/edit`);

  }

  deleteCategory(categoryId:number):void{
    this.categoryService.DeleteCategory(categoryId).subscribe(
      {
        next:(v) => this.message.success("Category Successfully Deleted",{nzDuration:4000}),
        error:(err) => this.message.error(`Error While deleting ${err.message}`,{nzDuration:5000})
      }
    )
  }

    // Bar chart data
    public polarChartOptions = {
    responsive: true,
    maintainAspectRatio: false
    };

    polarChartType: ChartType = 'bar';
    public polarChartLegend = true;
    public polarChartLabels: string[] = [];
    public polarChartData: any[] = [
      { data: [],
        label: 'Income' , 
        borderWidth: 1,
        backgroundColor:  [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        ],
        borderColor: '#FFFFFF',
        fill: true,},
      { data: [],
        label: 'Expense' ,
        borderWidth: 1,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        ],
        borderColor: '#FFFFFF',
        fill: true, }
    ];

  loadChartData(): void {
    this.categoryService.getIncomeCategoryData().subscribe((incomeData) => {
      const incomeLabels = incomeData.map((item: any) => item.name);
      const incomeValues = incomeData.map((item: any) => item.incomes.length);
      
      this.polarChartLabels = [...incomeLabels];
      this.polarChartData[0].data = [...incomeValues];

      this.categoryService.getExpenseCategoryData().subscribe((expenseData) => {
        const expenseValues = expenseData.map((item: any) => item.expenses.length);
        
        this.polarChartData[1].data = [...expenseValues];
      });
    });
  }

}
