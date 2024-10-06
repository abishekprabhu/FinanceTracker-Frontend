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
  styleUrl: './user.component.css',
})
export class UserComponent implements AfterViewInit {
  // Define styles for a grid layout
  gridStyle = {
    width: '50%',
    textAlign: 'center',
  };
  // Variables to store income, expenses, and stats data
  Incomes: any;
  expenses: any;
  stats: any;
  public isBrowser: boolean; // Flag to check if the code is running in the browser
  user = StorageService.getUser(); // Get the current user from storage

  // Inject necessary services through the constructor
  constructor(
    private statsService: StatsService, // Service to fetch statistical data
    @Inject(PLATFORM_ID) platformId: Object, // Inject platform ID to check if code is running on the browser
    private categoryService: CategoryService, // Service to manage categories
    private budgetService: BudgetService, // Service to manage budgets
    private message: NzMessageService, // Service to display messages and notifications
    private transactionService: TransactionService // Service to manage transactions
  ) {
    this.getAllStats(); // Fetch all statistics data upon component instantiation
    this.isBrowser = isPlatformBrowser(platformId); // Determine if the code is running in the browser
  }

  // Lifecycle hook called after the component's view has been fully initialized
  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Perform browser-specific operations
      this.loadCategoryData(); // Load data for categories
      this.getCategories(); // Fetch all categories
      this.loadBudgets(); // Load budgets data
      this.getAllTransaction(); // Fetch all transactions
    }
    this.getlineData(); // Load data for the line chart
    this.percentageCal(); // Calculate percentages for income, expenses, and balance
  }

  // Fetch all statistical data
  getAllStats(): void {
    this.statsService.getStats().subscribe({
      next: (v) => (this.stats = v),
      error: (e) => console.error('Error fetching stats:', e),
    });
  }

  // Line chart configuration options
  public lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  // Define the type and data for the line chart
  lineChartType: ChartType = 'line';
  public lineChartLegend = true;
  public lineChartLabels: string[] = []; // Labels for the x-axis (e.g., dates)
  public lineChartData: any[] = [
    {
      data: [], // Income data points
      label: 'Income',
      borderWidth: 1,
      backgroundColor: 'rgba(80, 200, 120, 0.2)',
      borderColor: 'rgb(0, 100, 0)',
      fill: true,
    },
    {
      data: [], // Expense data points
      label: 'Expense',
      borderWidth: 1,
      backgroundColor: 'rgba(255, 0, 0, 0.2)',
      borderColor: 'rgb(255, 0, 0)',
      fill: true,
    },
  ];

  // Fetch and prepare data for the line chart
  getlineData() {
    this.statsService.getChartMonthly().subscribe((data) => {
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
      this.lineChartData[0].data = incomeData.map(
        (income: any) => income.amount
      );
      this.lineChartData[1].data = expenseData.map(
        (expense: any) => expense.amount
      );

      // Log data for debugging
      console.log('Line Chart Labels:', this.lineChartLabels);
      console.log('Income Data:', this.lineChartData[0].data);
      console.log('Expense Data:', this.lineChartData[1].data);
      console.log('Combined Data:', this.lineChartData);
      console.log('Combined Labels:', this.lineChartLabels);
    });
  }

  // Variables to store income, expense, and balance percentages
  incomePercentage: number = 0;
  expensePercentage: number = 0;
  balancePercentage: number = 0;
  percentage: PercentageDTO[] = [];

  // Calculate income, expense, and balance percentages
  percentageCal(): void {
    this.statsService.getTransactionSummary(this.user.id).subscribe({
      next: (data) => {
        this.percentage = data;
        console.log(data);
        this.incomePercentage = data.incomePercentage;
        this.expensePercentage = data.expensePercentage;
        this.balancePercentage = data.balancePercentage;
      },
      error: (e) => {
        console.error(`Error fetching summary: ${e.message}`);
      },
    });
  }

  currentMonthIncome: number = 0;
  currentMonthExpense: number = 0;

  // Method to get current month's total income or expense
  getCurrentMonthData(dataList: any[], isIncome: boolean): number {
    const currentMonth = new Date().getMonth(); // Current month (0 = January, 11 = December)
    const currentYear = new Date().getFullYear(); // Current year

    return dataList
      .filter((data: any) => {
        const date = new Date(data.date);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      })
      .reduce((total: number, data: any) => total + data.amount, 0);
  }

  // Polar area chart configuration options
  public polarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  polarChartType: ChartType = 'polarArea';
  public polarChartLegend = true;
  public polarChartLabels: string[] = []; // Labels for the chart (e.g., category names)
  public polarChartData: any[] = [
    {
      data: [], // Income category data
      label: 'Income',
      borderWidth: 1.2,
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
      ],
      borderColor: '#ffffff',
      fill: true,
    },
    {
      data: [], // Expense category data
      label: 'Expense',
      borderWidth: 1.2,
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF',
        '#FF9F40',
      ],
      borderColor: '#ffffff',
      fill: true,
    },
  ];

  // Load data for categories to populate the polar area chart
  loadCategoryData(): void {
    // Fetch income category data
    this.categoryService.getIncomeCategoryData().subscribe((incomeData) => {
      const incomeLabels = incomeData.map((item: any) => item.name);
      const incomeValues = incomeData.map((item: any) => item.incomes.length);

      this.polarChartLabels = [...incomeLabels];
      this.polarChartData[0].data = [...incomeValues];

      // Fetch expense category data
      this.categoryService.getExpenseCategoryData().subscribe((expenseData) => {
        // const expenseLabels = expenseData.map((item: any) => item.name);
        const expenseValues = expenseData.map(
          (item: any) => item.expenses.length
        );
        // this.polarChartLabels = [...expenseLabels];
        this.polarChartData[1].data = [...expenseValues];
      });
    });
  }

  categories: CategoryDTO[] = [];
  budgets: BudgetDTO[] = [];
  totalSpent: number = 0;
  remainingBudget: number = 0;

  // Fetch all categories
  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) =>
        this.message.error(`Error Fetching Categories ${err.message}`, {
          nzDuration: 5000,
        }),
    });
  }
  // Load budgets for the current user
  loadBudgets() {
    this.budgetService.getBudgetsByUser(this.user.id).subscribe({
      next: (budgets) => {
        // this.budgets = budgets;
        // Map budgets to include category names
        this.budgets = budgets.map((budget: BudgetDTO) => {
          const category = this.categories.find(
            (cat) => cat.id === budget.categoryId
          );
          // console.log(budget.exceeded);
          return {
            ...budget,
            categoryName: category ? category.name : 'Unknown',
          };
        });
        console.log(budgets);
      },
      error: (error) => console.error('Error fetching budgets:', error),
    });
  }

  // Calculates the percentage of the budget used
  getBudgetUsage(budget: BudgetDTO): number {
    let usage = (budget.totalSpent / budget.amount) * 100;
    usage = Math.round(usage);
    return Math.min(usage, 100); // Ensure percentage doesn't exceed 100%
  }

  // Determines the stroke color for the budget usage indicator based on the percentage used
  getBudgetStrokeColor(budget: BudgetDTO): any {
    const usage = this.getBudgetUsage(budget);
    const category = this.categories.find(
      (cat) => cat.id === budget.categoryId
    );
    budget.categoryName = category ? category.name : 'Unknown';
    // Color transition from blue to green to red based on usage
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
  pageIndex: number = 1; // Current page index for pagination
  pageSize: number = 5; // Number of items per page
  sortField: string = ''; // Field to sort by
  sortOrder: string = ''; // Order to sort (ascend/descend)

  // Fetch all transactions for the current user
  getAllTransaction(): void {
    this.transactionService.getAllTransactionByUserId(this.user.id).subscribe({
      next: (transactions) => {
        // Map transactions to include category name instead of categoryId
        this.transactions = transactions.map((transaction: TransactionDTO) => {
          const category = this.categories.find(
            (cat) => cat.id === transaction.categoryId
          );
          return {
            ...transaction,
            categoryName: category ? category.name : 'Unknown',
          };
        });
        console.log(this.transactions); // Check the modified transaction objects
        this.updatePaginatedTransactions(); // Update the displayed transactions based on pagination and sorting
      },
      error: (e) =>
        this.message.error('Error Fetching transaction.' + e, {
          nzDuration: 5000,
        }),
    });
  }

  // Update the paginated transactions based on the current page, page size, and sorting
  updatePaginatedTransactions(): void {
    // Apply sorting before slicing for pagination
    const sortedTransactions = [...this.transactions].sort(
      this.getSortFn(this.sortField, this.sortOrder)
    );

    const startIndex = (this.pageIndex - 1) * this.pageSize;
    this.paginatedTransactions = sortedTransactions.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  // Generic sorting function based on field and order
  getSortFn(field: string | null, order: string) {
    return (a: TransactionDTO, b: TransactionDTO) => {
      if (!field) {
        return 0; // No sorting if field is not specified
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

  // Sort transactions by date
  sortByDate(a: TransactionDTO, b: TransactionDTO): number {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  }

  // Sort transactions by category name
  sortByCategory(a: TransactionDTO, b: TransactionDTO): number {
    return a.categoryName.localeCompare(b.categoryName);
  }

  // Handle sort order changes
  onSortChange(field: string, order: string | null): void {
    this.sortField = field;
    this.sortOrder = order || 'ascend'; // Default to 'ascend' if order is null
    this.updatePaginatedTransactions();
  }

  // Update page when pagination changes
  onPageChange(page: number): void {
    this.pageIndex = page;
    this.updatePaginatedTransactions();
  }
}
