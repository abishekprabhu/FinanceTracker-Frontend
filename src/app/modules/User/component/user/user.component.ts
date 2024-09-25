import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Chart, { ChartData, ChartOptions, ChartType } from 'chart.js/auto';
import { StatsService } from '../../Service/Stats/stats.service';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { PercentageDTO } from '../../../../model/Percentage/percentage-dto';
import { CategoryService } from '../../Service/Category/category.service';
import { BudgetDTO } from '../../../../model/Budget/budget-dto';
import { BudgetService } from '../../Service/Budget/budget.service';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { NzMessageService } from 'ng-zorro-antd/message';
import { TransactionService } from '../../Service/Transaction/transaction.service';
import { TransactionDTO } from '../../../../model/Transaction/transaction-dto';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements AfterViewInit {

  gridStyle = {
    width: '50%',
    textAlign: 'center',
  };
  
  // @ViewChild('incomeLineChartRef') private incomeLineChartRef!: ElementRef;
  // @ViewChild('expenseLineChartRef') private expenseLineChartRef!: ElementRef;
  Incomes: any;
  expenses: any;
  stats: any;
  public isBrowser: boolean;
  
  // Optional: To manage Chart instances
  // private incomeChart: Chart | null = null;
  // private expenseChart: Chart | null = null;

  constructor(private statsService: StatsService,
     @Inject(PLATFORM_ID) platformId: Object,
     private categoryService: CategoryService,
     private budgetService : BudgetService,
     private message : NzMessageService,
     private transactionService : TransactionService
  ) {
    this.getAllStats();
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // this.getCurrentMonthData();
      this.loadCategoryData();
      this.getCategories();
      this.loadBudgets();
      this.getAllTransaction();
    }
    this.getlineData();
    this.percentageCal();
  }

  // createLineChart(): void {
  //   if (this.incomeLineChartRef?.nativeElement && this.expenseLineChartRef?.nativeElement) {
  //     const incomeCtx = this.incomeLineChartRef.nativeElement.getContext('2d');
  //     const expenseCtx = this.expenseLineChartRef.nativeElement.getContext('2d');

  //     if (incomeCtx && expenseCtx) {
  //       const incomeLabels = this.Incomes.map((income: any) => {
  //         const date = new Date(income.date);
  //         return isNaN(date.getTime()) ? income.date : date.toLocaleDateString();
  //       });

  //       const expenseLabels = this.expenses.map((expense: any) => {
  //         const date = new Date(expense.date);
  //         return isNaN(date.getTime()) ? expense.date : date.toLocaleDateString();
  //       });

  //       // Log the labels and data for debugging
  //       console.log('Income Labels:', incomeLabels);
  //       console.log('Income Data:', this.Incomes.map((income: any) => income.amount));
  //       console.log('Expense Labels:', expenseLabels);
  //       console.log('Expense Data:', this.expenses.map((expense: any) => expense.amount));

  //       // Destroy existing charts if they exist
  //       if (this.incomeChart) {
  //         this.incomeChart.destroy();
  //       }
  //       if (this.expenseChart) {
  //         this.expenseChart.destroy();
  //       }

  //       // Create Income Chart
  //       this.incomeChart = new Chart(incomeCtx, {
  //         type: 'line',
  //         data: {
  //           labels: incomeLabels,
  //           datasets: [{
  //             label: 'Income',
  //             data: this.Incomes.map((income: any) => income.amount),
  //             borderWidth: 1,
  //             backgroundColor: 'rgba(80, 200, 120, 0.2)',
  //             borderColor: 'rgb(0, 100, 0)',
  //             fill: true,
  //           }]
  //         },
  //         options: {
  //           scales: {
  //             y: {
  //               beginAtZero: true
  //             }
  //           }
  //         }
  //       });

  //       // Create Expense Chart
  //       this.expenseChart = new Chart(expenseCtx, {
  //         type: 'line',
  //         data: {
  //           labels: expenseLabels,
  //           datasets: [{
  //             label: 'Expense',
  //             data: this.expenses.map((expense: any) => expense.amount),
  //             borderWidth: 1,
  //             backgroundColor: 'rgba(255, 0, 0, 0.2)',
  //             borderColor: 'rgb(255, 0, 0)',
  //             fill: true,
  //           }]
  //         },
  //         options: {
  //           scales: {
  //             y: {
  //               beginAtZero: true
  //             }
  //           }
  //         }
  //       });
  //     } else {
  //       console.error('Failed to get 2D context for charts.');
  //     }
  //   } else {
  //     console.error('Chart elements are undefined.');
  //   }
  // }

  getAllStats(): void {
    this.statsService.getStats().subscribe({
      next: (v) => this.stats = v,
      error: (e) => console.error('Error fetching stats:', e)
    });
  }

  // getCurrentMonthData(): void {
  //   this.statsService.getChartMonthly().subscribe({
  //     next: (v) => {
  //       if (v.expenseList && v.incomeList) {
  //         this.Incomes = v.incomeList;
  //         this.expenses = v.expenseList;

  //         // Calculate current month's income and expense
  //         this.currentMonthIncome = this.getCurrentMonthData(this.Incomes, true);
  //         this.currentMonthExpense = this.getCurrentMonthData(this.expenses, false);
  //                   // Optionally log current month income/expense
  //         console.log('Current Month Income:', this.currentMonthIncome);
  //         console.log('Current Month Expense:', this.currentMonthExpense);
  //         // this.createLineChart();
  //       }
  //     },
  //     error: (e) => {
  //       console.error('Error fetching chart data:', e);
  //     }
  //   });
  // }

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
            fill: true,},
          { data: [], label: 'Expense' ,  borderWidth: 1,
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            borderColor: 'rgb(255, 0, 0)',
            fill: true, }
        ];

        getlineData() {
          this.statsService.getChartMonthly().subscribe(data => {
            this.Incomes = data.incomeList;
            this.expenses = data.expenseList;
            const incomeData = data.incomeList; // Ensure this is an array
            const expenseData = data.expenseList; // Ensure this is an array

            // Calculate current month's income and expense
            this.currentMonthIncome = this.getCurrentMonthData(this.Incomes, true);
            this.currentMonthExpense = this.getCurrentMonthData(this.expenses, false);
                      // Optionally log current month income/expense
            console.log('Current Month Income:', this.currentMonthIncome);
            console.log('Current Month Expense:', this.currentMonthExpense);

            // Map month numbers to month names
            this.lineChartLabels = incomeData.map((income: any) => {
              const date = new Date(income.date);
              return isNaN(date.getTime()) ? income.date : date.toLocaleDateString();
            });
        
            // Populate the data arrays for both income and expenses
            this.lineChartData[0].data = incomeData.map((income: any) => income.amount);
            this.lineChartData[1].data = expenseData.map((expense: any) => expense.amount);
        
            // Log data for debugging
            console.log('Line Chart Labels:', this.lineChartLabels);
            console.log('Income Data:', this.lineChartData[0].data);
            console.log('Expense Data:', this.lineChartData[1].data);
            console.log('Combined Data:', this.lineChartData);
            console.log('Combined Labels:', this.lineChartLabels);

          });
        }

        incomePercentage: number = 0;
        expensePercentage: number = 0;
        balancePercentage: number = 0;
        percentage:PercentageDTO [] = [];
        user = StorageService.getUser();

        percentageCal():void{
          this.statsService.getTransactionSummary(this.user.id).subscribe({
            next:(data)=> {
              this.percentage = data;
              console.log(data);
              this.incomePercentage = data.incomePercentage;
              this.expensePercentage = data.expensePercentage;
              this.balancePercentage = data.balancePercentage;
            },
            error:(e)=> {
              console.error(`Error fetching summary: ${e.message}`);
            }
        });
        }

        currentMonthIncome: number = 0;
        currentMonthExpense: number = 0;

            // Method to get current month data and sum
      getCurrentMonthData(dataList: any[], isIncome: boolean): number {
        const currentMonth = new Date().getMonth(); // Current month (0 = January, 11 = December)
        const currentYear = new Date().getFullYear(); // Current year

        return dataList
          .filter((data: any) => {
            const date = new Date(data.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((total: number, data: any) => total + data.amount, 0);
      }


            // Bar chart data
      public polarChartOptions = {
        responsive: true,
        maintainAspectRatio: false
        };
    
        polarChartType: ChartType = 'polarArea';
        public polarChartLegend = true;
        public polarChartLabels: string[] = [];
        public polarChartData: any[] = [
          { data: [],
            label: 'Income' , 
            borderWidth: 1.2,
            backgroundColor:  [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            ],
            borderColor: '#ffffff',
            fill: true,},
          { data: [],
            label: 'Expense' ,
            borderWidth: 1.2,
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
            ],
            borderColor: '#ffffff',
            fill: true, }
        ];

      // public polarAreaChartData: ChartData<'polarArea'> = {
      //   labels: [],
      //   datasets: [
      //     {
      //       data: [], // Income data
      //       label: 'Income Categories',
      //       backgroundColor: [
      //         '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
      //       ],
      //       borderColor: '#ffffff',
      //       borderWidth: 2,
      //     },
      //     // {
      //     //   data: [], // Expense data
      //     //   label: 'Expense Categories',
      //     //   backgroundColor: [
      //     //     '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
      //     //   ],
      //     //   borderColor: '#ffffff',
      //     //   borderWidth: 2,
      //     // },
      //   ],
      // };
    
      // public polarAreaChartOptions: ChartOptions<'polarArea'> = {
      //   responsive: true,
      //   plugins: {
      //     legend: {
      //       display: true,
      //       position: 'top',
      //     },
      //   },
      //   scales: {
      //     r: {
      //       ticks: {
      //         display: false,
      //       },
      //       grid: {
      //         circular: true,
      //       },
      //     },
      //   },
      // };

      loadCategoryData(): void {
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

      categories: CategoryDTO [] = [];
      budgets: BudgetDTO[] = [];
      totalSpent: number = 0;
      remainingBudget: number = 0;

      getCategories(): void {
        this.categoryService.getAllCategories().subscribe({
          next: (categories) => {
            this.categories = categories;
          },
          error: (err) => this.message.error(`Error Fetching Categories ${err.message}`, { nzDuration: 5000 })
        });
      }
    
    
        loadBudgets() {
          this.budgetService.getBudgetsByUser(this.user.id).subscribe({
            next: (budgets) => {
              // this.budgets = budgets;
              this.budgets = budgets.map((budget: BudgetDTO) => {
                const category = this.categories.find(cat => cat.id === budget.categoryId);
                // console.log(budget.exceeded);
                return {
                  ...budget,
                  categoryName: category ? category.name : 'Unknown'
                };
                
              });
              console.log(budgets)
            },
            error: (error) => console.error('Error fetching budgets:', error)
          });
        }

        // Calculates the percentage of the budget used
        getBudgetUsage(budget: BudgetDTO): number {
          let usage = (budget.totalSpent / budget.amount) * 100;
          usage = Math.round(usage);
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


        transactions: TransactionDTO[] = [];
        paginatedTransactions: TransactionDTO[] = [];
        filteredTransactions: TransactionDTO[] = [];
        pageIndex: number = 1;
        pageSize: number = 5;
        sortField: string = '';
        sortOrder: string = '';
        
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
              this.updatePaginatedTransactions();
            },
            error: (e) => this.message.error("Error Fetching transaction." + e, { nzDuration: 5000 })
          });
        }
        
        updatePaginatedTransactions(): void {
          // Apply sorting before slicing for pagination
          const sortedTransactions = [...this.transactions].sort(this.getSortFn(this.sortField, this.sortOrder));
        
          const startIndex = (this.pageIndex - 1) * this.pageSize;
          this.paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + this.pageSize);
        }
        
        // Generic sorting function
        getSortFn(field: string | null, order: string) {
          return (a: TransactionDTO, b: TransactionDTO) => {
            if (!field) {
              return 0;
            }
        
            let valueA, valueB;
        
            switch (field) {
              case 'date':
                valueA = new Date(a.date).getTime();
                valueB = new Date(b.date).getTime();
                break;
              case 'categoryName':
                valueA = a.categoryName;
                valueB = b.categoryName;
                break;
              default:
                return 0; // Default to no sorting if the field is not recognized
            }
        
            if (order === 'ascend') {
              return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else if (order === 'descend') {
              return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        
            return 0;
          };
        }
        
        
        // Sort by date (example for binding)
        sortByDate(a: TransactionDTO, b: TransactionDTO): number {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        
        // Sort by category (example for binding)
        sortByCategory(a: TransactionDTO, b: TransactionDTO): number {
          return a.categoryName.localeCompare(b.categoryName);
        }
        
        // Handle sort order changes
        onSortChange(field: string, order: string | null): void {
          this.sortField = field;
          this.sortOrder = order || 'ascend';  // Default to 'ascend' if order is null
          this.updatePaginatedTransactions();
        }
        
        
        // Update page when pagination changes
        onPageChange(page: number): void {
          this.pageIndex = page;
          this.updatePaginatedTransactions();
        }
        
  
}
