import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BudgetService } from '../../Service/Budget/budget.service';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { BudgetDTO } from '../../../../model/Budget/budget-dto';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { CategoryService } from '../../Service/Category/category.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonSize } from 'ng-zorro-antd/button';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit {

  categories: CategoryDTO [] = [];
  user = StorageService.getUser();
  budgets: BudgetDTO[] = [];
  totalSpent: number = 0;
  remainingBudget: number = 0;

  // Pie Chart Settings
  // public pieChartLabels: string[] = ['Total Spent', 'Remaining'];
  // public pieChartData: ChartData<'pie', number[], string | string[]> = {
  //   labels: this.pieChartLabels,
  //   datasets: [
  //     {
  //       data: [0, 0], // Initial data
  //       backgroundColor: ['#FF6384', '#36A2EB'], // Optional: Customize the colors
  //     }
  //   ]
  // };
  // public pieChartType: ChartType = 'pie';
  // public pieChartOptions: ChartOptions = {
  //   responsive: true,
  //   maintainAspectRatio: false
  // };

  pieChartDataList: Array<ChartData<'pie', number[], string | string[]>> = [];
  pieChartType: ChartType = 'pie';
  pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false
  };


  budgetForm = this.fb.group({
    amount: this.fb.control('', [Validators.required, Validators.min(1)]),
    startDate:this.fb.control('',Validators.required),
    endDate:this.fb.control('',Validators.required),
    categoryId: this.fb.control('',Validators.required),
    userId: [this.user.id, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private budgetService: BudgetService,
    private categoryService:CategoryService,
    private message : NzMessageService,
  ) { }

  ngOnInit(): void {
    this.getCategories();
    this.loadBudgets();
  }

    isVisible = false;
    isOkLoading = false;

    showModal(): void {
      this.isVisible = true;
    }

    handleOk(): void {
      this.isOkLoading = true;
      setTimeout(() => {
        this.isVisible = false;
        this.isOkLoading = false;
      }, 1000);
    }

    handleCancel(): void {
      this.isVisible = false;
    }
    size: NzButtonSize = 'large';
    // isLoadingOne = false;  
    // loadOne(): void {
    //   this.isLoadingOne = true;
    //   setTimeout(() => {
    //     this.isLoadingOne = false;
    //   }, 5000);
    // }

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => this.message.error(`Error Fetching Categories ${err.message}`, { nzDuration: 5000 })
    });
  }

  onSubmit() {
     this.budgetService.createBudget(this.budgetForm.value).subscribe({
        next: (response) => {
          this.message.success("Budget Created.",{nzDuration:5000});
          this.loadBudgets();
        },
        error: (error) => this.message.error(`Something went wrong ${error.message}`, {nzDuration:5000})
      });
    }

    loadBudgets() {
      this.budgetService.getBudgetsByUser(this.user.id).subscribe({
        next: (budgets) => {
          // this.budgets = budgets;
          this.budgets = budgets.map((budget: BudgetDTO) => {
            const category = this.categories.find(cat => cat.id === budget.categoryId);
            console.log(budget.exceeded);
            return {
              ...budget,
              categoryName: category ? category.name : 'Unknown'
            };
            
          });
          
          this.createPieChartsForBudgets();
        },
        error: (error) => console.error('Error fetching budgets:', error)
      });
    }
  

    createPieChartsForBudgets() {
      this.pieChartDataList = this.budgets.map((budget) => {
        const totalSpent = budget.totalSpent;
        const remainingBudget = Math.max(0, budget.amount - totalSpent); // Clamp to avoid negative
        const spentPercentage = Math.min(100, (totalSpent / budget.amount) * 100); // Ensure it's not over 100%
        const remainingPercentage = 100 - spentPercentage;
        
        return {
          labels: ['Total Spent', 'Remaining'],
          datasets: [
            {
              data: [spentPercentage, remainingPercentage],
              backgroundColor: ['#FF6384', '#36A2EB'],
              hoverBackgroundColor: ['#FF6384', '#36A2EB']
            }
          ]
        };
      });
    }    
  
    // getBudgetUsage(budget: BudgetDTO): number {
    //   return (budget.totalSpent / budget.amount) * 100;
    // }

    deleteBudget(id:number) {
        this.budgetService.DeleteBudget(id).subscribe({
          next:()=> this.message.success("Budget Deleted Successful.",{nzDuration:5000}),
          error:(error)=> this.message.error(`Error while deleting Budget ${error.message}`,{nzDuration:5000})
        });
      }

      // Calculates the percentage of the budget used
      getBudgetUsage(budget: BudgetDTO): number {
        const usage = (budget.totalSpent / budget.amount) * 100;
        return Math.min(usage, 100); // Ensure percentage doesn't exceed 100%
      }

      // Determines the stroke color based on the percentage used
      getBudgetStrokeColor(budget: BudgetDTO): any {
        const usage = this.getBudgetUsage(budget);
        const category = this.categories.find(cat => cat.id === budget.categoryId);
        budget.categoryName = category ? category.name : 'Unknown';
        // Color transition from blue to green to red
        if (usage <= 75) {
          return { '0%': '#108ee9', '100%': '#87d068' }; // Blue to Green for under-budget
        } else if (usage > 75 && usage <= 100) {
          return { '0%': '#108ee9', '100%': '#ffcc00' }; // Blue to Yellow for nearing the limit
        } else {
          return { '0%': '#ff4d4f', '100%': '#ff0000' }; // Red for exceeding the budget
        }
      }


      
}
