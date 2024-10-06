import { Component, OnInit } from '@angular/core';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { TransactionService } from '../../Service/Transaction/transaction.service';
import { FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CategoryService } from '../../Service/Category/category.service';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { TransactionDTO } from '../../../../model/Transaction/transaction-dto';
import { saveAs } from 'file-saver';
import { error } from 'console';
import { StatsService } from '../../Service/Stats/stats.service';
import { ChartType } from 'chart.js';
import { NzButtonSize } from 'ng-zorro-antd/button';
@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css',
})
export class TransactionComponent implements OnInit {
  listOfTransaction: any[] = ['INCOME', 'EXPENSE'];
  categories: CategoryDTO[] = [];
  transactions: TransactionDTO[] = [];
  paginatedTransactions: TransactionDTO[] = [];
  filteredTransactions: TransactionDTO[] = []; // For filtered results
  pageIndex: number = 1;
  pageSize: number = 5;
  searchTerm: string = '';
  amountSearchTerm: number | null = null; // Search by amount
  selectedCategory: string = '';
  selectedType: string = ''; // Search by income/expense type
  dateOrder: string = ''; // For sorting
  size: NzButtonSize = 'large';

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private message: NzMessageService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    this.getCategories();
    this.getAllTransaction();
    this.getBarData();
  }

  user = StorageService.getUser();

  transactionForm = this.fb.group({
    amount: this.fb.control('', Validators.required),
    description: this.fb.control('', Validators.required),
    date: this.fb.control('', Validators.required),
    type: this.fb.control('', Validators.required),
    categoryId: this.fb.control('', Validators.required),
    userId: this.user.id,
  });

  submitForm() {
    console.log(this.transactionForm.value);
    this.transactionService
      .postTransaction(this.transactionForm.value)
      .subscribe({
        next: (v) => {
          this.message.success('transaction Created.', { nzDuration: 5000 });
          this.getAllTransaction();
          this.getBarData();
        },
        error: (e) =>
          this.message.error(`Something went wrong ${e.message}`, {
            nzDuration: 5000,
          }),
      });
  }

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        // Fetch transaction only after categories are loaded
        // this.getAllTransaction();
      },
      error: (err) =>
        this.message.error(`Error Fetching Categories ${err.message}`, {
          nzDuration: 5000,
        }),
    });
  }

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
        this.applyFilters(); // Apply filters after loading transactions
        console.log(this.transactions); // Check the modified transaction objects
        this.updatePaginatedTransactions();
      },
      error: (e) =>
        this.message.error('Error Fetching transaction.' + e, {
          nzDuration: 5000,
        }),
    });
  }

  deleteTransaction(id: number) {
    console.log('transaction Delete id: ' + id);
    this.transactionService.DeleteTransaction(id).subscribe({
      next: () =>
        this.message.success('Transaction deleted Successfully', {
          nzDuration: 5000,
        }),
      error: () =>
        this.message.error('Error while deleteing Transaction.', {
          nzDuration: 5000,
        }),
      complete: () => this.getAllTransaction(),
    });
  }

  downloadMonthlyReport(): void {
    this.transactionService.DownloadMonthlyReport().subscribe({
      next: (response: Blob) => {
        const file = new Blob([response], { type: 'application/pdf' });
        saveAs(file, 'monthly-transaction-report.pdf');
        this.message.success(`PDF Created Successful.`, { nzDuration: 5000 });
      },
      error: (err) => {
        this.message.error(`error while extracting pdf ${err.message}`, {
          nzDuration: 5000,
        });
      },
    });
  }

  // dateForm = this.fb.group({
  //   startDate: ['', Validators.required],
  //   endDate: ['', Validators.required]
  // });
  // downloadPdf() {
  //   const { startDate, endDate } = this.dateForm.value;

  //   // Ensure startDate and endDate are not undefined or null
  //   const validStartDate = startDate ?? '';// Nullish Coalescing Operator (??)
  //   const validEndDate = endDate ?? '';

  //   console.log("Valid: "+validStartDate,validEndDate);
  //   if (validStartDate && validEndDate) {
  //     this.transactionService.getTransactionsPdf(validStartDate, validEndDate).subscribe({
  //       next:(response: Blob) => {
  //         saveAs(response, 'transactions.pdf');
  //         this.message.success('PDF Created Successfully', { nzDuration: 5000 });
  //       },
  //       error:(error) => {
  //         // console.error('Error downloading the PDF', error);
  //         this.message.error(`Error downloading the PDF ${error.message}`, { nzDuration: 5000 });
  //       }
  //   });
  //   } else {
  //     this.message.error('Please provide valid start and end dates', { nzDuration: 5000 });
  //   }
  // }

  applyFilters(): void {
    let filtered = [...this.transactions];

    // Apply search filter by description
    if (this.searchTerm) {
      filtered = filtered.filter((transaction) =>
        transaction.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply search filter by amount
    if (this.amountSearchTerm !== null) {
      filtered = filtered.filter(
        (transaction) => transaction.amount === this.amountSearchTerm
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(
        (transaction) => transaction.categoryName === this.selectedCategory
      );
    }

    // Apply income/expense type filter
    if (this.selectedType) {
      filtered = filtered.filter(
        (transaction) => transaction.type === this.selectedType
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

    this.filteredTransactions = filtered;
    this.updatePaginatedTransactions();
  }

  updatePaginatedTransactions(): void {
    const startIndex = (this.pageIndex - 1) * this.pageSize;
    const endIndex = this.pageIndex * this.pageSize;
    this.paginatedTransactions = this.filteredTransactions.slice(
      startIndex,
      endIndex
    );
  }

  onPageChange(page: number): void {
    this.pageIndex = page;
    this.updatePaginatedTransactions();
  }

  // updatePaginatedTransactions(): void {
  //   const startIndex = (this.pageIndex - 1) * this.pageSize;
  //   this.paginatedTransactions = this.transactions.slice(startIndex, startIndex + this.pageSize);
  // }

  // Bar chart data
  public barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartLabels: string[] = [];
  public barChartData: any[] = [
    { data: [], label: 'Income' },
    { data: [], label: 'Expense' },
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
      const incomeData = data.incomeData; // Assuming incomeData is a map
      const expenseData = data.expenseData; // Assuming expenseData is a map

      // Map month numbers to month names
      this.barChartLabels = Object.keys(incomeData).map(
        (month) => this.monthNames[+month]
      );
      this.barChartData[0].data = Object.values(incomeData);
      this.barChartData[1].data = Object.values(expenseData);
    });
  }
}
