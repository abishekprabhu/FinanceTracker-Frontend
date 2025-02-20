import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BudgetDTO } from '../../../../model/Budget/budget-dto';

const BASE_URL = 'https://dcff881aae7c.onrender.com/api/budgets';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  constructor(private http: HttpClient) {}

  createBudget(budget: any): Observable<any> {
    return this.http
      .post<any>(BASE_URL + `/create`, budget)
      .pipe(catchError(this.handleError));
  }

  getBudgetsByUser(userId: number): Observable<BudgetDTO[]> {
    return this.http
      .get<BudgetDTO[]>(BASE_URL + `/user/${userId}`)
      .pipe(catchError(this.handleError));
  }

  getBudgetsByUserAndCategory(
    userId: number,
    categoryId: number
  ): Observable<any[]> {
    return this.http.get<any[]>(
      BASE_URL + `/user/${userId}/category/${categoryId}`
    );
  }

  getBudgetById(budgetId: number): Observable<BudgetDTO> {
    return this.http
      .get<BudgetDTO>(BASE_URL + `/${budgetId}`)
      .pipe(catchError(this.handleError));
  }

  monitorBudget(budgetId: number): Observable<number> {
    return this.http.get<number>(BASE_URL + `/monitor/${budgetId}`);
  }

  updateBudget(budgetId: number, budgetDTO: any): Observable<BudgetDTO> {
    return this.http
      .put<BudgetDTO>(BASE_URL + `/${budgetId}`, budgetDTO)
      .pipe(catchError(this.handleError));
  }

  DeleteBudget(budgetId: number): Observable<any> {
    return this.http
      .delete(BASE_URL + `/${budgetId}`)
      .pipe(catchError(this.handleError));
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
