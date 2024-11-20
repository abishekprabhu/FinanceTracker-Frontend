import { Component, OnInit } from '@angular/core';
import { WalletDTO } from '../../../../model/Wallet/wallet-dto';
import { TransactionDetailsDTO } from '../../../../model/Wallet/transaction-details-dto';
import { WalletService } from '../../Service/Wallet/wallet.service';
import { PayBillDTO } from '../../../../model/Bill/pay-bill-dto';
import { FormBuilder, Validators } from '@angular/forms';
import { CategoryService } from '../../Service/Category/category.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { BillService } from '../../Service/Bill/bill.service';
import { BillDTO } from '../../../../model/Bill/bill-dto';
import { RazorpayService } from '../../Service/Razorpay/razorpay.service';
import { StatsService } from '../../Service/Stats/stats.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css',
})
export class WalletComponent implements OnInit {
  user = StorageService.getUser();
  wallet: WalletDTO[] = [];
  transactions: TransactionDetailsDTO[] = [];
  categories: CategoryDTO[] = [];
  addAmount: number = 0;
  walletId: number = 1;
  walletcategoryID = 12;
  WalletForm = this.fb.group({
    amount: this.fb.control('', Validators.required),
    // categoryId: this.fb.control('',Validators.required),
    categoryId: [{ value: 12, disabled: true }],
    userId: this.user.id,
    // walletId: this.walletId,
  });

  constructor(
    private walletService: WalletService,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private message: NzMessageService,
    private billService: BillService,
    private winRef: RazorpayService,
    private statsService: StatsService
  ) {}

  ngOnInit(): void {
    this.user;
    this.getCategories();
    this.loadTransactions(this.walletId);
    this.loadUnpaidBills();
    this.getMyWallet();
    this.getAllStats();

    this.WalletForm.patchValue({
      // ...wallet,
      categoryId: 12, // Keep categoryId for selection
    });
  }

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

  myWallet: any = this.fb.group({
    balance: this.fb.control('', Validators.required),
    categoryName: this.fb.control('', Validators.required),
    userId: this.user.id,
  });

  getMyWallet() {
    this.walletService.getWallet(this.user.id).subscribe({
      next: (wallet) => {
        // Find the category by id and set categoryName
        const category = this.categories.find(
          (cat) => cat.id === wallet.categoryId
        );
        wallet.categoryName = category ? category.name : 'Unknown';

        // Log for debugging
        console.log(wallet);

        // Update form values
        this.myWallet.patchValue({
          ...wallet,
          categoryId: wallet.categoryId, // Keep categoryId for selection
        });
      },
      error: () =>
        this.message.error('Error while Fetching expense.', {
          nzDuration: 5000,
        }),
    });
  }

  // Load transaction history
  loadTransactions(walletId: number) {
    this.walletService
      .getTransactionDetailsByDesc(walletId)
      .subscribe((data) => {
        this.transactions = data;
        this.updatePaginatedTransactions();
      });
  }

  AddMoneyOffline() {
    if (this.WalletForm.valid) {
      const amount: number = parseFloat(this.WalletForm.value.amount || '0');
      const categoryId: number = Number(this.WalletForm.value.categoryId);
      const walletDTO: WalletDTO = {
        id: 0, // This may be auto-generated or fetched from the backend
        amount: amount,
        balance: 0, // Initially set balance to 0, or fetch the current balance
        categoryId: categoryId,
        categoryName: '', // This will be handled by the backend if needed
        userId: this.user.id,
      };

      // Initiate Razorpay payment and then add money to the wallet on successful payment
      this.walletService.addMoneyToWallet(walletDTO).subscribe({
        next: (response) => {
          this.message.success('Money added successfully', {
            nzDuration: 5000,
          });
          this.getMyWallet();
        },
        error: (err) => {
          this.message.error(`Something went wrong ${err.message}`, {
            nzDuration: 5000,
          });
        },
      });
    } else {
      this.message.error('Invalid form. Please fill in all required fields.', {
        nzDuration: 5000,
      });
    }
  }

  stats: any;
  getAllStats(): void {
    this.statsService.getStats().subscribe({
      next: (v) => (this.stats = v),
      error: (e) => console.error('Error fetching stats:', e),
    });
  }

  AddMoneyOnline() {
    if (this.WalletForm.valid) {
      const amount: number = parseFloat(this.WalletForm.value.amount || '0');
      // Check if the entered amount is valid
      if (isNaN(amount) || amount <= 0) {
        this.message.error('Invalid amount. Please enter a valid number.', {
          nzDuration: 5000,
        });
        return;
      }

      // Check if the user's balance is lower than the amount they want to add
      if (this.stats?.balance < amount) {
        // Insufficient balance in income, ask the user to add more money to income first
        this.message.error(
          'Insufficient balance. Please add money to your INCOME.',
          {
            nzDuration: 5000,
          }
        );
        return; // Stop the process if balance is insufficient
      }

      // console.log(this.WalletForm.value);
      // const categoryId: number = Number(this.WalletForm.value.categoryId);
      const walletDTO: WalletDTO = {
        id: 0, // This may be auto-generated or fetched from the backend
        amount: amount,
        balance: 0, // Initially set balance to 0, or fetch the current balance
        // categoryId: categoryId,
        categoryId: 12,
        categoryName: '', // This will be handled by the backend if needed
        userId: this.user.id,
      };

      console.log(walletDTO);

      // Initiate payment and then add money to the wallet on successful payment
      this.initiateRazorpayPaymentForWallet(amount, walletDTO);
      this.getMyWallet();
    }
  }

  // Razorpay payment method for adding money to wallet
  initiateRazorpayPaymentForWallet(amount: number, walletDTO: WalletDTO) {
    const options: any = {
      key: 'rzp_test_t51Ev8vhVfMTFO', // Razorpay API Key
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'FINANCE TRACKER',
      image: 'https://cdn-icons-png.flaticon.com/128/781/781760.png',
      description: 'Add money to wallet',
      handler: (response: any) => {
        // Success Callback
        console.log('Payment successful', response);
        // alert('Payment successful: ' + response.razorpay_payment_id);

        // Call backend API to update wallet after successful payment
        this.walletService.addMoneyToWallet(walletDTO).subscribe({
          next: (result) => {
            this.message.success(
              'Payment Successful: ' + response.razorpay_payment_id,
              { nzDuration: 5000 }
            );
            console.log('Wallet updated successfully', result);
            // alert('Wallet balance updated.');
            this.message.success('Wallet balance updated.', {
              nzDuration: 5000,
            });
            this.getMyWallet();
            this.loadTransactions(this.walletId);
          },
          error: (error) => {
            console.error('Error updating wallet:', error.message);
            // alert('Failed to update wallet.');
            this.message.error(`Failed to update wallet. ${error.message}`, {
              nzDuration: 5000,
            });
          },
        });
      },
      prefill: {
        name: 'Abishek Prabhu',
        email: 'abi@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3399cc',
      },
    };

    try {
      const rzp = new this.winRef.nativeWindow.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay Error:', error);
    }
  }

  // Pay a specific bill
  payBill(billId: number): void {
    // Find the bill by ID
    const selectedBill = this.bills.find((bill) => bill.id === billId);

    if (!selectedBill) {
      this.message.error('Bill not found', { nzDuration: 5000 });
      return;
    }
    const billAmount = selectedBill.amountDue; // Get the bill amount

    // Check if the wallet balance is sufficient
    this.walletService.getWallet(this.user.id).subscribe({
      next: (wallet) => {
        if (wallet.balance < billAmount) {
          // Insufficient balance, prompt the user to add money first
          this.message.error(
            'Insufficient balance. Please add money to your wallet.',
            { nzDuration: 5000 }
          );
          return; // Stop the process
        }

        // If balance is sufficient, proceed with Razorpay payment
        const payBillDTO: PayBillDTO = {
          billId: billId,
          userId: this.user.id,
        };

        this.initiateRazorpayPaymentForBill(billAmount, payBillDTO);
      },
      error: (error) => {
        this.message.error(`Failed to fetch wallet balance. ${error.message}`, {
          nzDuration: 5000,
        });
      },
    });

    // const payBillDTO: PayBillDTO = {
    //   billId: billId,
    //   userId: this.user.id,
    // };

    // const billAmount = selectedBill.amountDue; // Get the bill amount
    console.log('BILL AMOUNT' + billAmount);
    // console.log('PAY BILL ID : ' + payBillDTO);
    // Initiate payment and then pay the bill on successful payment
    // this.initiateRazorpayPaymentForBill(billAmount, payBillDTO);
  }

  // Razorpay payment method for paying bill
  initiateRazorpayPaymentForBill(amount: number, payBillDTO: PayBillDTO) {
    const options: any = {
      key: 'rzp_test_t51Ev8vhVfMTFO', // Razorpay API Key
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'FINANCE TRACKER',
      image: 'https://cdn-icons-png.flaticon.com/128/781/781760.png',
      description: 'Pay bill',
      handler: (response: any) => {
        // Success Callback
        console.log('Payment successful', response);
        // alert('Payment successful: ' + response.razorpay_payment_id);
        this.message.success(
          'Payment successful: ' + response.razorpay_payment_id,
          { nzDuration: 2000 }
        );

        // Call backend API to pay bill after successful payment
        this.walletService.payBill(payBillDTO).subscribe({
          next: (result) => {
            console.log(payBillDTO);
            this.message.success(
              'Payment successful: ' + response.razorpay_payment_id,
              { nzDuration: 2000 }
            );
            console.log('Bill paid successfully', result);
            // alert('Bill paid successfully.');
            this.message.success('Bill paid successfully.', {
              nzDuration: 5000,
            });
            this.getMyWallet();
            this.loadUnpaidBills();
            this.loadTransactions(this.walletId);
          },
          error: (error) => {
            console.log(payBillDTO);
            console.error('Error paying bill:', error.message);
            // alert('Failed to pay bill.');
            this.message.error(`Failed to pay bill. ${error.message.message}`, {
              nzDuration: 5000,
            });
          },
        });
      },
      prefill: {
        name: 'Abishek Prabhu',
        email: 'abi@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3399cc',
      },
    };

    try {
      const rzp = new this.winRef.nativeWindow.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay Error:', error);
    }
  }

  bills: BillDTO[] = [];

  loadUnpaidBills(): void {
    this.billService.getUnpaidBills(this.user.id).subscribe({
      next: (data) => {
        // this.bills = data;
        this.bills = data.map((bill: BillDTO) => {
          const category = this.categories.find(
            (cat) => cat.id === bill.categoryId
          );
          return {
            ...bill,
            categoryName: category ? category.name : 'Unknown',
          };
        });
        console.log(this.bills);
        this.updatePaginatedBills();
      },
      error: (err) =>
        this.message.error(`Error Fetching Bills ${err.message}`, {
          nzDuration: 5000,
        }),
    });
  }

  paginatedTransactions: TransactionDetailsDTO[] = [];
  filteredTransactions: TransactionDetailsDTO[] = [];
  pageIndex: number = 1; // Current page index for pagination
  pageSize: number = 5; // Number of items per page
  sortField: string = ''; // Field to sort by
  sortOrder: string = ''; // Order to sort (ascend/descend)

  // Sort transactions by date
  sortByDate(a: TransactionDetailsDTO, b: TransactionDetailsDTO): number {
    return (
      new Date(a.transactionDate).getTime() -
      new Date(b.transactionDate).getTime()
    );
  }

  // Sort transactions by category name
  sortByCategory(a: TransactionDetailsDTO, b: TransactionDetailsDTO): number {
    return a.paymentMethod.localeCompare(b.paymentMethod);
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
    return (a: TransactionDetailsDTO, b: TransactionDetailsDTO) => {
      if (!field) {
        return 0; // No sorting if field is not specified
      }

      let valueA, valueB;

      switch (field) {
        case 'date':
          valueA = new Date(a.transactionDate).getTime();
          valueB = new Date(b.transactionDate).getTime();
          break;
        case 'paymentMethod':
          valueA = a.paymentMethod;
          valueB = b.paymentMethod;
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

  paginatedBills: BillDTO[] = [];
  filteredBills: BillDTO[] = [];
  // pageIndex: number = 1; // Current page index for pagination
  // pageSize: number = 5; // Number of items per page
  // sortField: string = ''; // Field to sort by
  // sortOrder: string = ''; // Order to sort (ascend/descend)

  // Sort Bills by date
  sortByBillDate(a: BillDTO, b: BillDTO): number {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }

  // Sort Bills by category name
  sortByBillCategory(a: BillDTO, b: BillDTO): number {
    return a.categoryName.localeCompare(b.categoryName);
  }

  // Handle sort order changes
  onSortBillChange(field: string, order: string | null): void {
    this.sortField = field;
    this.sortOrder = order || 'ascend'; // Default to 'ascend' if order is null
    this.updatePaginatedBills();
  }

  // Update page when pagination changes
  onPageBillChange(page: number): void {
    this.pageIndex = page;
    this.updatePaginatedBills();
  }
  // Update the paginated Bills based on the current page, page size, and sorting
  updatePaginatedBills(): void {
    // Apply sorting before slicing for pagination
    const sortedBills = [...this.bills].sort(
      this.getSortBillFn(this.sortField, this.sortOrder)
    );

    const startIndex = (this.pageIndex - 1) * this.pageSize;
    this.paginatedBills = sortedBills.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  // Generic sorting function based on field and order
  getSortBillFn(field: string | null, order: string) {
    return (a: BillDTO, b: BillDTO) => {
      if (!field) {
        return 0; // No sorting if field is not specified
      }

      let valueA, valueB;

      switch (field) {
        case 'date':
          valueA = new Date(a.dueDate).getTime();
          valueB = new Date(b.dueDate).getTime();
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
  getRowStyle(dueDate: Date): { backgroundColor: string } {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days

    if (diffDays > 7) {
      return { backgroundColor: 'lightgreen' }; // More than 7 days
    } else if (diffDays > 0 && diffDays <= 7) {
      return { backgroundColor: 'lightyellow' }; // Due soon (within 7 days)
    } else {
      return { backgroundColor: 'lightcoral' }; // Overdue
    }
  }
  getRemainingDays(dueDate: Date): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
  }
}
