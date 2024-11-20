import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { BillDTO } from '../../../../model/Bill/bill-dto';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { BillService } from '../../Service/Bill/bill.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { CategoryService } from '../../Service/Category/category.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-bill',
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.css',
})
export class BillComponent implements OnInit {
  categories: CategoryDTO[] = [];
  bills: BillDTO[] = [];
  // newBill: BillDTO = new ();
  user = StorageService.getUser();
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private router: Router,
    private billService: BillService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  billForm = this.fb.group({
    amountDue: this.fb.control('', [Validators.required, Validators.min(1)]),
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
        this.getAllBills();
      },
      error: (err) =>
        this.message.error(`Error Fetching Categories ${err.message}`, {
          nzDuration: 5000,
        }),
    });
  }

  // Fetch all bills for a user
  getAllBills(): void {
    this.billService.getAllBills(this.user.id).subscribe({
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

  // Create a new bill
  createBill(): void {
    this.billService.createBill(this.billForm.value).subscribe({
      next: (bill) => {
        this.message.success('Bill Created.', { nzDuration: 5000 });
        this.getAllBills();
      },
      error: (e) =>
        this.message.error(`Something went wrong ${e.message}`, {
          nzDuration: 5000,
        }),
    });
  }

  // Update a bill
  // updateBill(bill: BillDTO): void {
  //   this.billService.updateBill(bill.id, bill).subscribe((updatedBill) => {
  //     const index = this.bills.findIndex((b) => b.id === updatedBill.id);
  //     this.bills[index] = updatedBill;
  //   });
  // }

  // Delete a bill
  deleteBill(billId: number): void {
    this.billService.deleteBill(billId).subscribe(() => {
      this.bills = this.bills.filter((bill) => bill.id !== billId);
    });
  }

  paginatedBills: BillDTO[] = [];
  filteredBills: BillDTO[] = [];
  pageIndex: number = 1; // Current page index for pagination
  pageSize: number = 5; // Number of items per page
  sortField: string = ''; // Field to sort by
  sortOrder: string = ''; // Order to sort (ascend/descend)

  // Sort Bills by date
  sortByDate(a: BillDTO, b: BillDTO): number {
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }

  // Sort Bills by category name
  sortByCategory(a: BillDTO, b: BillDTO): number {
    return a.categoryName.localeCompare(b.categoryName);
  }

  // Handle sort order changes
  onSortChange(field: string, order: string | null): void {
    this.sortField = field;
    this.sortOrder = order || 'ascend'; // Default to 'ascend' if order is null
    this.updatePaginatedBills();
  }

  // Update page when pagination changes
  onPageChange(page: number): void {
    this.pageIndex = page;
    this.updatePaginatedBills();
  }
  // Update the paginated Bills based on the current page, page size, and sorting
  updatePaginatedBills(): void {
    // Apply sorting before slicing for pagination
    const sortedBills = [...this.bills].sort(
      this.getSortFn(this.sortField, this.sortOrder)
    );

    const startIndex = (this.pageIndex - 1) * this.pageSize;
    this.paginatedBills = sortedBills.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  // Generic sorting function based on field and order
  getSortFn(field: string | null, order: string) {
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

  // Generate PDF for each bill
  // generateBillPDF(bill: BillDTO): void {
  //   const pdf = new jsPDF();

  //   pdf.setFontSize(20);
  //   pdf.text('Bill Details', 14, 20);

  //   pdf.setFontSize(12);
  //   pdf.text(`Description: ${bill.description}`, 14, 30);
  //   pdf.text(`Amount Due: ${bill.amountDue} INR`, 14, 40);
  //   pdf.text(
  //     `Due Date: ${new Date(bill.dueDate).toLocaleDateString()}`,
  //     14,
  //     50
  //   );
  //   pdf.text(`Category: ${bill.categoryName}`, 14, 60);
  //   pdf.text(`Payment Status: ${bill.paid ? 'SUCCESS' : 'PENDING'}`, 14, 70);

  //   pdf.save(`Bill_${bill.id}.pdf`);
  // }

  selectedBill: BillDTO | null = null;
  @ViewChild('invoiceTemplate', { static: false }) invoiceTemplate!: ElementRef;
  bill = {
    customerName: 'Abishek Prabhu',
    customerAddress: '123 Main St, Anytown, USA',
    customerEmail: 'abi@gmail.com',
    items: [
      {
        description: 'Web Development Services',
        amountDue: 200,
        dueDate: new Date(),
      },
      { description: 'Hosting Services', amountDue: 50, dueDate: new Date() },
    ],
  };

  generateBillPDF(bill: BillDTO): void {
    this.selectedBill = bill;
    console.log(this.selectedBill);

    this.cdr.detectChanges();

    // Temporarily display the invoice if it's hidden
    const invoiceElement = this.invoiceTemplate.nativeElement;
    invoiceElement.style.display = 'block';

    // Use html2canvas to convert the invoice template to a canvas
    html2canvas(invoiceElement, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0); // Use 'jpeg' format to avoid potential PNG issues

        const pdf = new jsPDF();
        const imgWidth = 190; // width of the PDF
        const pageHeight = pdf.internal.pageSize.height;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        let position = 0;

        // Add the image to the PDF and handle page breaks if needed
        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`Invoice_${bill.id}.pdf`); // Save the generated PDF

        // Hide the invoice template again if needed
        invoiceElement.style.display = 'none';
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
      });
  }
}
