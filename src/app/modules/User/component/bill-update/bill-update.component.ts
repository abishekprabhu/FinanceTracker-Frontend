import { Component } from '@angular/core';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { BillDTO } from '../../../../model/Bill/bill-dto';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { FormBuilder, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ActivatedRoute, Router } from '@angular/router';
import { BillService } from '../../Service/Bill/bill.service';
import { CategoryService } from '../../Service/Category/category.service';

@Component({
  selector: 'app-bill-update',
  templateUrl: './bill-update.component.html',
  styleUrl: './bill-update.component.css',
})
export class BillUpdateComponent {
  categories: CategoryDTO[] = [];
  bills: BillDTO[] = [];
  // newBill: BillDTO = new ();
  user = StorageService.getUser();
  submitted = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private billService: BillService,
    private categoryService: CategoryService
  ) {}

  billForm = this.fb.group({
    amountDue: this.fb.control('', Validators.required),
    description: this.fb.control('', Validators.required),
    dueDate: this.fb.control('', Validators.required),
    categoryId: this.fb.control('', Validators.required),
    userId: this.user.id,
  });

  ngOnInit(): void {
    this.getCategories();
    this.user;
  }

  getCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.fetchBill();
      },
      error: (err) =>
        this.message.error(`Error Fetching Categories ${err.message}`, {
          nzDuration: 5000,
        }),
    });
  }

  billId: number = this.activatedRoute.snapshot.params['id'];

  fetchBill(): void {
    if (this.user?.id && this.billId) {
      this.billService.getBillById(this.user.id, this.billId).subscribe({
        next: (bill) => {
          // Find the category by id and set categoryName
          const category = this.categories.find(
            (cat) => cat.id === bill.categoryId
          );
          bill.categoryName = category ? category.name : 'Unknown';

          // Log for debugging
          console.log(bill);

          // Update form values, converting amountDue and categoryId to string
          this.billForm.patchValue({
            ...bill,
            dueDate: this.formatDate(new Date(bill.dueDate)), // Format date if necessary
            categoryId: bill.categoryId.toString(), // Convert categoryId (number) to string
            amountDue: bill.amountDue.toString(), // Convert amountDue (number) to string
          });
        },
        error: () =>
          this.message.error('Error while Fetching bill.', {
            nzDuration: 5000,
          }),
      });
    }
  }

  // Utility method for date formatting (optional, if needed)
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add 1 since months are 0-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // Format as YYYY-MM-DD or change as per your needs
  }

  onSubmit(): void {
    if (this.billForm.valid) {
      // Prepare the form data

      // Call the update bill service
      this.billService.updateBill(this.billId, this.billForm.value).subscribe({
        next: () => {
          this.message.success('Bill updated successfully!', {
            nzDuration: 5000,
          });
          this.router.navigateByUrl('/user/bills');
        },
        error: (err) =>
          this.message.error(`Error Updating expense ${err.message}`, {
            nzDuration: 5000,
          }),
      });
    } else {
      this.message.error('Please fill in all required fields.', {
        nzDuration: 5000,
      });
    }
  }

  // // Format date if the backend expects a different format
  // formatDateForBackend(date: string): string {
  //   const selectedDate = new Date(date);
  //   return selectedDate.toISOString().split('T')[0]; // Format as yyyy-MM-dd
  // }
}
