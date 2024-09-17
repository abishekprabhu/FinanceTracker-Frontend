import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(private router: Router) { }

  canActivate: CanActivateFn = () => {
    const userSession = StorageService.isCustomerLoggedIn();

    if (userSession) {
      return true; // User is authenticated
    } else {
      this.router.navigate(['/unauthorized']); // Redirect to Unauthorized if not authenticated
      return false;
    }
  };
}
