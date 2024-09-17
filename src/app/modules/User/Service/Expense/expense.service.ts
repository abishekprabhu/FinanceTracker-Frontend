import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ExpenseDTO } from '../../../../model/Expense/expense-dto';

  const BASE_URL = "http://localhost:8080/api/expense";
  
@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  
  constructor(private http : HttpClient) { }

  postExpense(ExpenseDTO:any):Observable<any>{
    return this.http.post(BASE_URL,ExpenseDTO).pipe(
      catchError(this.handleError)
    );
  }

  getExpenseAll(): Observable<ExpenseDTO[]>{
    return this.http.get<ExpenseDTO[]>(BASE_URL+"/all").pipe(
      catchError(this.handleError)
    );
  }

  getExpenseById(id:number): Observable<ExpenseDTO>{
    return this.http.get<ExpenseDTO>(BASE_URL+`/${id}`);
  }

  updateExpense(id:number, ExpenseDTO:ExpenseDTO):Observable<string>{
    return this.http.put(BASE_URL+`/${id}`,ExpenseDTO, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  DeleteExpense(id:number):Observable<string>{
    return this.http.delete(BASE_URL+`/${id}`, { responseType: 'text' });
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
