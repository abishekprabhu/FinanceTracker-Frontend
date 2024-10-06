import { Injectable } from '@angular/core';

const USER = 'user';
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  // // Helper function to check if sessionStorage is available
  private static isSessionStorageAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.sessionStorage !== 'undefined'
    );
  }

  // Save user data in sessionStorage
  static saveUser(user: any): void {
    // if (this.isSessionStorageAvailable()) {
    // console.log("Storing user in sessionStorage", user); // Debugging line
    // window.sessionStorage.removeItem(USER);
    window.sessionStorage.setItem(USER, JSON.stringify(user));
    // } else {
    //   console.log("SessionStorage not available");
    // }
  }

  // Retrieve the user data from sessionStorage
  static getUser(): any {
    if (this.isSessionStorageAvailable()) {
      return JSON.parse(window.sessionStorage.getItem(USER) || '{}');
    }
    return null; // Default return if sessionStorage is not available
  }

  // Get the user role from the stored user data
  static getUserRole(): string {
    const user = this.getUser();
    if (user == null) return '';
    return user.role; // Return the user's role (e.g., ADMIN or CUSTOMER)
  }

  // Check if the logged-in user is a customer
  static isCustomerLoggedIn(): boolean {
    const user = this.getUser();
    // console.log("User in sessionStorage:", user); // Debugging line
    return user && user.id != null;
  }

  // Get the user ID from the stored user data
  static getUserId(): string {
    const user = this.getUser();
    if (user == null) return '';
    return user.id;
  }

  // Remove token and user data from sessionStorage (i.e., log out the user)
  static signout(): void {
    if (this.isSessionStorageAvailable()) {
      window.sessionStorage.removeItem(USER);
    }
  }
}
