import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BillDTO } from '../../../../model/Bill/bill-dto';

const BASE_URL = 'http://localhost:8080/api/bills';
@Injectable({
  providedIn: 'root',
})
export class BillService {
  constructor(private http: HttpClient) {}

  createBill(billDto: any): Observable<BillDTO> {
    return this.http
      .post<BillDTO>(BASE_URL + `/create`, billDto)
      .pipe(catchError(this.handleError));
  }

  getAllBills(userId: number): Observable<BillDTO[]> {
    return this.http
      .get<BillDTO[]>(BASE_URL + `/all/${userId}`)
      .pipe(catchError(this.handleError));
  }

  getUnpaidBills(userId: number): Observable<BillDTO[]> {
    return this.http
      .get<BillDTO[]>(BASE_URL + `/unpaid/${userId}`)
      .pipe(catchError(this.handleError));
  }

  updateBill(billId: number, bill: any): Observable<BillDTO> {
    return this.http
      .put<BillDTO>(BASE_URL + `/${billId}`, bill)
      .pipe(catchError(this.handleError));
  }

  deleteBill(billId: number): Observable<void> {
    return this.http
      .delete<void>(BASE_URL + `/${billId}`)
      .pipe(catchError(this.handleError));
  }

  // Get a bill by userId and billId
  getBillById(userId: number, billId: number): Observable<BillDTO> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('billId', billId.toString());
    return this.http.get<BillDTO>(BASE_URL + `/findByBillId`, { params });
  }

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
