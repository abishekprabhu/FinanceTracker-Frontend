import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Chart, { ChartType } from 'chart.js/auto';
import { StatsService } from '../../Service/Stats/stats.service';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { PercentageDTO } from '../../../../model/Percentage/percentage-dto';

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
  
  @ViewChild('incomeLineChartRef') private incomeLineChartRef!: ElementRef;
  @ViewChild('expenseLineChartRef') private expenseLineChartRef!: ElementRef;
  Incomes: any;
  expenses: any;
  stats: any;
  public isBrowser: boolean;
  
  // Optional: To manage Chart instances
  private incomeChart: Chart | null = null;
  private expenseChart: Chart | null = null;

  constructor(private statsService: StatsService, @Inject(PLATFORM_ID) platformId: Object) {
    this.getAllStats();
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.getChartData();
    }
    this.getlineData();
    this.percentageCal();
  }

  createLineChart(): void {
    if (this.incomeLineChartRef?.nativeElement && this.expenseLineChartRef?.nativeElement) {
      const incomeCtx = this.incomeLineChartRef.nativeElement.getContext('2d');
      const expenseCtx = this.expenseLineChartRef.nativeElement.getContext('2d');

      if (incomeCtx && expenseCtx) {
        const incomeLabels = this.Incomes.map((income: any) => {
          const date = new Date(income.date);
          return isNaN(date.getTime()) ? income.date : date.toLocaleDateString();
        });

        const expenseLabels = this.expenses.map((expense: any) => {
          const date = new Date(expense.date);
          return isNaN(date.getTime()) ? expense.date : date.toLocaleDateString();
        });

        // Log the labels and data for debugging
        console.log('Income Labels:', incomeLabels);
        console.log('Income Data:', this.Incomes.map((income: any) => income.amount));
        console.log('Expense Labels:', expenseLabels);
        console.log('Expense Data:', this.expenses.map((expense: any) => expense.amount));

        // Destroy existing charts if they exist
        if (this.incomeChart) {
          this.incomeChart.destroy();
        }
        if (this.expenseChart) {
          this.expenseChart.destroy();
        }

        // Create Income Chart
        this.incomeChart = new Chart(incomeCtx, {
          type: 'line',
          data: {
            labels: incomeLabels,
            datasets: [{
              label: 'Income',
              data: this.Incomes.map((income: any) => income.amount),
              borderWidth: 1,
              backgroundColor: 'rgba(80, 200, 120, 0.2)',
              borderColor: 'rgb(0, 100, 0)',
              fill: true,
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });

        // Create Expense Chart
        this.expenseChart = new Chart(expenseCtx, {
          type: 'line',
          data: {
            labels: expenseLabels,
            datasets: [{
              label: 'Expense',
              data: this.expenses.map((expense: any) => expense.amount),
              borderWidth: 1,
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              borderColor: 'rgb(255, 0, 0)',
              fill: true,
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      } else {
        console.error('Failed to get 2D context for charts.');
      }
    } else {
      console.error('Chart elements are undefined.');
    }
  }

  getAllStats(): void {
    this.statsService.getStats().subscribe({
      next: (v) => this.stats = v,
      error: (e) => console.error('Error fetching stats:', e)
    });
  }

  getChartData(): void {
    this.statsService.getChartMonthly().subscribe({
      next: (v) => {
        if (v.expenseList && v.incomeList) {
          this.Incomes = v.incomeList;
          this.expenses = v.expenseList;

          // Calculate current month's income and expense
          this.currentMonthIncome = this.getCurrentMonthData(this.Incomes, true);
          this.currentMonthExpense = this.getCurrentMonthData(this.expenses, false);
                    // Optionally log current month income/expense
          console.log('Current Month Income:', this.currentMonthIncome);
          console.log('Current Month Expense:', this.currentMonthExpense);
          this.createLineChart();
        }
      },
      error: (e) => {
        console.error('Error fetching chart data:', e);
      }
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
            const incomeData = data.incomeList; // Ensure this is an array
            const expenseData = data.expenseList; // Ensure this is an array
        
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
  
}
