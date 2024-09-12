import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserDTO } from '../../../model/User-Model/user-dto';

   const BASE_URL = "http://localhost:8080/api/user"
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http : HttpClient) { }

   signup(userDTO:UserDTO):Observable<any>{
    return this.http.post(BASE_URL+"/signup",userDTO).pipe(
      catchError(this.handleError)
    );
   }

   login(userDTO:UserDTO):Observable<any>{
    return this.http.post(BASE_URL+"/login",userDTO).pipe(
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
