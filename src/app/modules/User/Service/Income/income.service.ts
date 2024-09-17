import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'; 
import { IncomeDTO } from '../../../../model/Income/income-dto';

  const BASE_URL = "http://localhost:8080/api/income"
@Injectable({
  providedIn: 'root'
})
export class IncomeService {

  constructor(private http : HttpClient) { }

  postIncome(incomeDTO:any):Observable<any>{
    return this.http.post(BASE_URL,incomeDTO).pipe(
      catchError(this.handleError)
    );
  }

  // getIncomeAll(): Observable<any>{
  //   return this.http.get(BASE_URL+"api/income/all");
  // }
  getIncomeAll(): Observable<IncomeDTO[]>{
    return this.http.get<IncomeDTO[]>(BASE_URL+"/all").pipe(
      catchError(this.handleError)
    );
  }

  getIncomeById(id:number): Observable<IncomeDTO>{
    return this.http.get<IncomeDTO>(BASE_URL+`/${id}`);
  }

  updateIncome(id:number, incomeDTO:IncomeDTO):Observable<string>{
    return this.http.put(BASE_URL+`/${id}`,incomeDTO, { responseType: 'text' }).pipe(
      catchError(this.handleError)
    );
  }

  DeleteIncome(id:number):Observable<string>{
    return this.http.delete(BASE_URL+`/${id}`, { responseType: 'text' })
    .pipe(
      catchError(this.handleError)
    );
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
