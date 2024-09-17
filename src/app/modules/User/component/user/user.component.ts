import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Chart from 'chart.js/auto';
import { StatsService } from '../../Service/Stats/stats.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent implements AfterViewInit {

  gridStyle = {
    width: '25%',
    textAlign: 'center'
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
    this.statsService.getChart().subscribe({
      next: (v) => {
        if (v.expenseList && v.incomeList) {
          this.Incomes = v.incomeList;
          this.expenses = v.expenseList;
          this.createLineChart();
        }
      },
      error: (e) => {
        console.error('Error fetching chart data:', e);
      }
    });
  }
}
