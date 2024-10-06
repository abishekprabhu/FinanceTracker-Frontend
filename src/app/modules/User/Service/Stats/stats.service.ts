import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, pipe, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const BASE_URL = 'http://localhost:8080/';

const apiUrl = 'http://localhost:8080/api/transaction/summary';
@Injectable({
  providedIn: 'root',
})
export class StatsService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<any> {
    return this.http
      .get(BASE_URL + 'api/stats')
      .pipe(catchError(this.handleError));
  }

  getChartMonthly(): Observable<any> {
    return this.http
      .get(BASE_URL + 'api/stats/chart/monthly')
      .pipe(catchError(this.handleError));
  }

  getChartWeekly(): Observable<any> {
    return this.http
      .get(BASE_URL + 'api/stats/chart/weekly')
      .pipe(catchError(this.handleError));
  }

  getChartQuartarly(): Observable<any> {
    return this.http
      .get(BASE_URL + 'api/stats/chart/quartarly')
      .pipe(catchError(this.handleError));
  }

  getChartYearly(): Observable<any> {
    return this.http
      .get(BASE_URL + 'api/stats/chart/yearly')
      .pipe(catchError(this.handleError));
  }
  //bar chart
  getMonthlyData(): Observable<any> {
    return this.http
      .get(BASE_URL + `api/stats/monthly-data`)
      .pipe(catchError(this.handleError));
  }

  getTransactionSummary(userId: number): Observable<any> {
    return this.http
      .get<any>(BASE_URL + `api/stats/summary/${userId}`)
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
