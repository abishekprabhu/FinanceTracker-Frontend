import { Injectable } from '@angular/core';
import { TransactionDTO } from '../../../../model/Transaction/transaction-dto';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'; 

 const BASE_URL = "http://localhost:8080/api/transaction";
 const PDF_URL = "http://localhost:8080/api/pdf";
@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private http : HttpClient) { }

  postTransaction(TransactionDTO:any):Observable<any>{
    return this.http.post(BASE_URL,TransactionDTO).pipe(
      catchError(this.handleError)
    );
  }

  // gettransactionAll(): Observable<any>{
  //   return this.http.get(BASE_URL+"api/transaction/all");
  // }
  getAllTransactionByUserId(id:number): Observable<TransactionDTO[]>{
    return this.http.get<TransactionDTO[]>(BASE_URL+`/user/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getTransactionById(id:number): Observable<TransactionDTO>{
    return this.http.get<TransactionDTO>(BASE_URL+`/${id}`);
  }

  updateTransaction(id:number, TransactionDTO:any):Observable<string>{
    return this.http.put(BASE_URL+`/${id}`,TransactionDTO, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  DeleteTransaction(id:number):Observable<string>{
    return this.http.delete(BASE_URL+`/${id}`, { responseType: 'text' })
    .pipe(
      catchError(this.handleError)
    );
  }

  // getTransactionsPdf(startDate: string, endDate: string): Observable<any> {
  //   const params = new HttpParams()
  //     .set('startDate', startDate)
  //     .set('endDate', endDate);
      
  //   return this.http.get(PDF_URL+"/transactions", { params: params, responseType: 'blob' }).pipe(
  //     catchError(this.handleError)
  //   );
  // }


  DownloadMonthlyReport():Observable<any>{
    return this.http.get(PDF_URL+"/monthly-report", { responseType: 'blob' })
    .pipe(catchError(this.handleError))
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = ` Server error ${error.status}: ${error.error.message || error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
