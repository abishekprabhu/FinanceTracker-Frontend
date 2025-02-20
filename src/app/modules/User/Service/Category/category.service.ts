import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CategoryDTO } from '../../../../model/Category/category-dto';
import { StorageService } from '../../../../auth/services/storage/storage.service';
const BASE_URL = 'http://localhost:8080/api/categories';
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  constructor(private http: HttpClient) {}
  USER = StorageService.getUser();
  createCategory(categoryDTO: any): Observable<any> {
    return this.http
      .post(BASE_URL, categoryDTO)
      .pipe(catchError(this.handleError));
  }

  getCategoryById(categoryId: number): Observable<any> {
    return this.http
      .get<CategoryDTO>(BASE_URL + `/${categoryId}`)
      .pipe(catchError(this.handleError));
  }

  getIncomeCategoryData(): Observable<any> {
    return this.http
      .get(BASE_URL + `/income/user/${this.USER.id}`)
      .pipe(catchError(this.handleError));
  }

  getExpenseCategoryData(): Observable<any> {
    return this.http
      .get(BASE_URL + `/expense/user/${this.USER.id}`)
      .pipe(catchError(this.handleError));
  }

  getAllCategories(): Observable<any> {
    return this.http
      .get(BASE_URL + `/all/user/${this.USER.id}`)
      .pipe(catchError(this.handleError));
  }

  DeleteCategory(id: number): Observable<string> {
    return this.http.delete(BASE_URL + `/${id}`, { responseType: 'text' });
  }

  updateCategory(id: number, categoryDTO: any): Observable<any> {
    return this.http
      .put(BASE_URL + `/${id}`, categoryDTO)
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
