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
  styleUrl: './expense.component.css',
})
export class ExpenseComponent {
  categories: CategoryDTO[] = [];

  expenses: ExpenseDTO[] = [];

  paginatedExpenses: ExpenseDTO[] = [];
  filteredExpenses: ExpenseDTO[] = [];
  pageIndex: number = 1;
  pageSize: number = 5;
  searchTerm: string = '';
  selectedCategory: string = '';
  dateOrder: string = '';

  constructor(
    private fb: FormBuilder,
    private expenseService: ExpenseService,
    private categoryService: CategoryService,
    private message: NzMessageService,
    private router: Router,
    private statsService: StatsService
  ) {}

  user = StorageService.getUser();

  ngOnInit() {
    this.getCategories();
    this.user;
    this.getBarData();
    this.getlineData();
    this.getAllStats();
    // console.log(this.getCategories());
    // console.log(this.expenseForm);
    // console.log(this.getAllExpense());
  }

  expenseForm = this.fb.group({
    amount: this.fb.control('', Validators.required),
    description: this.fb.control('', Validators.required),
    date: this.fb.control('', Validators.required),
    categoryId: this.fb.control('', Validators.required),
    userId: this.user.id,
  });

  id!: number;
  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Fetch expenses only after categories are loaded
        this.getAllExpense();
      },
      error: (err) =>
        this.message.error(`Error Fetching Categories ${err.message}`, {
          nzDuration: 5000,
        }),
    });
  }

  submitForm() {
    console.log(this.expenseForm.value);
    this.expenseService.postExpense(this.expenseForm.value).subscribe({
      next: (v) => {
        this.message.success('Expense Created.', { nzDuration: 5000 });
        this.getAllExpense();
        this.getBarData();
        this.getlineData();
        this.getAllStats();
      },
      error: (e) =>
        this.message.error(`Something went wrong ${e.message}`, {
          nzDuration: 5000,
        }),
    });
  }

  getAllExpense(): void {
    this.expenseService.getAllExpenseByUserId(this.user.id).subscribe({
      next: (expenses) => {
        // Map expenses to include category name instead of categoryId
        this.expenses = expenses.map((expense: ExpenseDTO) => {
          const category = this.categories.find(
            (cat) => cat.id === expense.categoryId
          );
          return {
            ...expense,
            categoryName: category ? category.name : 'Unknown',
          };
        });
        this.applyFilters();
        console.log(this.expenses);
        this.updatePaginatedExpenses();
      },
      error: (e) =>
        this.message.error('Error Fetching expense.' + e, { nzDuration: 5000 }),
    });
  }

  deleteExpense(id: number) {
    this.expenseService.DeleteExpense(id).subscribe({
      next: () =>
        this.message.success('Expense deleted Successfully', {
          nzDuration: 5000,
        }),
      error: () =>
        this.message.error('Error while deleteing expense.', {
          nzDuration: 5000,
        }),
      complete: () => this.getAllExpense(),
    });
  }

  // Bar chart data
  public barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartLabels: string[] = [];
  public barChartData: any[] = [
    // { data: [], label: 'Income' },
    {
      data: [],
      label: 'Expense',
      borderColor: '#FF6384',
      backgroundColor: '#FFB1C1',
    },
  ];
  private monthNames: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  getBarData() {
    this.statsService.getMonthlyData().subscribe((data) => {
      // const incomeData = data.incomeData; // Assuming incomeData is a map
      const expenseData = data.expenseData; // Assuming expenseData is a map

      // Map month numbers to month names
      this.barChartLabels = Object.keys(expenseData).map(
        (month) => this.monthNames[+month]
      );
      // this.barChartData[0].data = Object.values(incomeData);
      this.barChartData[0].data = Object.values(expenseData);
    });
  }

  // Bar chart data
  public lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  lineChartType: ChartType = 'line';
  public lineChartLegend = true;
  public lineChartLabels: string[] = [];
  public lineChartData: any[] = [
    {
      data: [],
      label: 'Expense',
      borderWidth: 1,
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      borderColor: 'rgb(255, 0, 0)',
      fill: true,
    },
  ];

  getlineData() {
    this.statsService.getChartMonthly().subscribe((data) => {
      // const incomeData = data.incomeList; // Ensure this is an array
      const expenseData = data.expenseList; // Ensure this is an array

      // Map month numbers to month names
      this.lineChartLabels = expenseData.map((expense: any) => {
        const date = new Date(expense.date);
        return isNaN(date.getTime()) ? expense.date : date.toLocaleDateString();
      });

      // Populate the data arrays for both income and expenses
      // this.lineChartData[0].data = incomeData.map((income: any) => income.amount);
      this.lineChartData[0].data = expenseData.map(
        (expense: any) => expense.amount
      );

      // Log data for debugging
      console.log('Line Chart Labels:', this.lineChartLabels);
      // console.log('Income Data:', this.lineChartData[0].data);
      console.log('Expense Data:', this.lineChartData[0].data);
      console.log('Combined Data:', this.lineChartData);
      console.log('Combined Labels:', this.lineChartLabels);
    });
  }

  stats: any;

  gridStyle = {
    width: '50%',
    textAlign: 'center',
  };
  getAllStats(): void {
    this.statsService.getUserStats(this.user.id).subscribe({
      next: (v) => {
        this.stats = v;
        console.log(v.expenses);
        console.log(this.stats);
      },
      error: (e) => console.error('Error fetching stats:', e),
    });
  }

  applyFilters(): void {
    let filtered = [...this.expenses];

    // Apply search filter by description
    if (this.searchTerm) {
      filtered = filtered.filter((expense) =>
        expense.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(
        (expense) => expense.categoryName === this.selectedCategory
      );
    }

    // Apply date sorting
    if (this.dateOrder === 'asc') {
      filtered.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    } else if (this.dateOrder === 'desc') {
      filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }

    this.filteredExpenses = filtered;
    this.updatePaginatedExpenses();
  }

  updatePaginatedExpenses(): void {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = this.pageIndex * this.pageSize;
    this.paginatedExpenses = this.filteredExpenses.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.updatePaginatedExpenses();
  }
}
