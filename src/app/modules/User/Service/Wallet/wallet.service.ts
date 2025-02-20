import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { WalletDTO } from '../../../../model/Wallet/wallet-dto';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TransactionDetailsDTO } from '../../../../model/Wallet/transaction-details-dto';
import { PayBillDTO } from '../../../../model/Bill/pay-bill-dto';
import { RazorpayService } from '../Razorpay/razorpay.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { BillService } from '../Bill/bill.service';
// declare var Razorpay: any;
@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private baseUrl = 'https://dcff881aae7c.onrender.com/api/wallet';

  user = StorageService.getUser();

  constructor(
    private http: HttpClient,
    private winRef: RazorpayService,
    private message: NzMessageService,
    private billService: BillService
  ) {}

  // Fetch wallet details by userId
  getWallet(userId: number): Observable<WalletDTO> {
    return this.http
      .get<WalletDTO>(`${this.baseUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  // Add money to wallet
  addMoneyToWallet(walletDTO: WalletDTO): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/add`, walletDTO, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  // Pay bill using wallet
  payBill(payBillDTO: PayBillDTO): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/pay`, payBillDTO, { responseType: 'text' })
      .pipe(catchError(this.handleError));
  }

  // Fetch transaction details for a wallet
  getTransactionDetails(walletId: number): Observable<TransactionDetailsDTO[]> {
    return this.http
      .get<TransactionDetailsDTO[]>(`${this.baseUrl}/transactions/${walletId}`)
      .pipe(catchError(this.handleError));
  }

  getTransactionDetailsByDesc(
    walletId: number
  ): Observable<TransactionDetailsDTO[]> {
    return this.http
      .get<TransactionDetailsDTO[]>(
        `${this.baseUrl}/transactions/${walletId}/desc`
      )
      .pipe(catchError(this.handleError));
  }

  // // Razorpay payment method for adding money to wallet
  // initiateRazorpayPaymentForWallet(amount: number, walletDTO: WalletDTO) {
  //   const options: any = {
  //     key: 'rzp_test_t51Ev8vhVfMTFO', // Razorpay API Key
  //     amount: amount * 100, // Amount in paise
  //     currency: 'INR',
  //     name: 'My Wallet',
  //     description: 'Add money to wallet',
  //     handler: (response: any) => {
  //       // Success Callback
  //       console.log('Payment successful', response);
  //       // alert('Payment successful: ' + response.razorpay_payment_id);
  //       this.message.success(
  //         'Payment Successful: ' + response.razorpay_payment_id,
  //         { nzDuration: 5000 }
  //       );

  //       // Call backend API to update wallet after successful payment
  //       this.addMoneyToWallet(walletDTO).subscribe({
  //         next: (result) => {
  //           this.getWallet(this.user.id);
  //           console.log('Wallet updated successfully', result);
  //           // alert('Wallet balance updated.');
  //           this.message.success('Wallet balance updated.', {
  //             nzDuration: 5000,
  //           });
  //           this.getWallet(this.user.id);
  //         },
  //         error: (error) => {
  //           console.error('Error updating wallet:', error.message);
  //           // alert('Failed to update wallet.');
  //           this.message.error(`Failed to update wallet. ${error.message}`, {
  //             nzDuration: 5000,
  //           });
  //         },
  //       });
  //     },
  //     prefill: {
  //       name: 'Abishek Prabhu',
  //       email: 'abi@example.com',
  //       contact: '9999999999',
  //     },
  //     theme: {
  //       color: '#3399cc',
  //     },
  //   };

  //   try {
  //     const rzp = new this.winRef.nativeWindow.Razorpay(options);
  //     rzp.open();
  //   } catch (error) {
  //     console.error('Razorpay Error:', error);
  //   }
  // }

  // // Razorpay payment method for paying bill
  // initiateRazorpayPaymentForBill(amount: number, payBillDTO: PayBillDTO) {
  //   const options: any = {
  //     key: 'rzp_test_t51Ev8vhVfMTFO', // Razorpay API Key
  //     amount: amount * 100, // Amount in paise
  //     currency: 'INR',
  //     name: 'My Wallet',
  //     description: 'Pay bill',
  //     handler: (response: any) => {
  //       // Success Callback
  //       console.log('Payment successful', response);
  //       // alert('Payment successful: ' + response.razorpay_payment_id);
  //       this.message.success(
  //         'Payment successful: ' + response.razorpay_payment_id,
  //         { nzDuration: 2000 }
  //       );

  //       // Call backend API to pay bill after successful payment
  //       this.payBill(payBillDTO).subscribe({
  //         next: (result) => {
  //           console.log(payBillDTO);
  //           this.message.success(
  //             'Payment successful: ' + response.razorpay_payment_id,
  //             { nzDuration: 2000 }
  //           );
  //           console.log('Bill paid successfully', result);
  //           // alert('Bill paid successfully.');
  //           this.message.success('Bill paid successfully.', {
  //             nzDuration: 5000,
  //           });
  //           this.getWallet(this.user.id);
  //           this.billService.getUnpaidBills(this.user.id);
  //         },
  //         error: (error) => {
  //           console.log(payBillDTO);
  //           console.error('Error paying bill:', error.message);
  //           // alert('Failed to pay bill.');
  //           this.message.error(`Failed to pay bill. ${error.message}`, {
  //             nzDuration: 5000,
  //           });
  //         },
  //       });
  //     },
  //     prefill: {
  //       name: 'Abishek Prabhu',
  //       email: 'abi@example.com',
  //       contact: '9999999999',
  //     },
  //     theme: {
  //       color: '#3399cc',
  //     },
  //   };

  //   try {
  //     const rzp = new this.winRef.nativeWindow.Razorpay(options);
  //     rzp.open();
  //   } catch (error) {
  //     console.error('Razorpay Error:', error);
  //   }
  // }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = ` Server error ${error.status}: ${
        error.error.message || error.message
      }`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
