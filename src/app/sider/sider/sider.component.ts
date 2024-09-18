import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../auth/services/storage/storage.service';
import { NavigationEnd, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AbstractControl, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../auth/services/auth/auth.service';

// Custom validator function for password strength
function passwordValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const value = control.value;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(value);

  if (hasUpper && hasLower && hasNumber && hasSpecial) {
    return null;
  } else {
    return { 'pattern': true };
  }
}
@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrl: './sider.component.css'
})
export class SiderComponent implements OnInit{
  isCollapsed = false;
  isLoggedIn = false;
  isVisibleMiddle = false;
  passwordVisible = false;
  isSpinning : boolean = false; 
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService : AuthService,
    private message : NzMessageService
  ){ }

  user: any;

  resetPasswordForm: FormGroup = this.fb.group({
    email: [{ value: '', disabled: true }],  // Set default empty value
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8), passwordValidator]],
  }); 

  // ngOnInit(): void {
  //   // Check if the user is logged in
  //   this.isLoggedIn = StorageService.isCustomerLoggedIn();
  //   this.router.events.subscribe((event) => {
  //     if (event instanceof NavigationEnd) {
  //       this.isLoggedIn = StorageService.isCustomerLoggedIn();
  //     }
  //   });
  // }

  ngOnInit(): void {
    // Check if the user is logged in
    this.isLoggedIn = StorageService.isCustomerLoggedIn();
    
    // Fetch user if logged in
    if (this.isLoggedIn) {
      this.user = StorageService.getUser();
      if (this.user) {
        // If the user object exists, patch the form with the user email
        this.resetPasswordForm.patchValue({ email: this.user.email });
        this.getProfilePicture();
      }
    }

    // Listen for navigation events
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoggedIn = StorageService.isCustomerLoggedIn();
      }
    });
  }


  signout(){
        // Clear the session and redirect to login
    StorageService.signout();
    this.isLoggedIn = false;
    this.message.success("Logout Successful.");
    this.router.navigateByUrl("/login");
  }

  showModalMiddle(): void {
    this.isVisibleMiddle = true;
  }

  handleOkMiddle(): void {
    console.log('click ok');
    this.isVisibleMiddle = false;
  }

  handleCancelMiddle(): void {
    this.isVisibleMiddle = false;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      // Enable the email field to include it in the form submission
      this.resetPasswordForm.get('email')?.enable();

      this.isSpinning = true;
      console.log('Form Submitted', this.resetPasswordForm.value);

      this.authService.resetPassword(this.resetPasswordForm.value).subscribe({
        next: (res) => {
          this.message.success("Password Reset Successful!", { nzDuration: 5000 });
          console.log(res);
          this.handleOkMiddle();
        },
        error: (err) => {
          this.message.error(`Password Reset Unsuccessful: ${err.message}`, { nzDuration: 5000 });
        }
      });

      this.isSpinning = false;

      // Disable the email field again after submission
      this.resetPasswordForm.get('email')?.disable();
    }
  }

  previewUrl: string | ArrayBuffer | null = null;
    // Fetch and display the profile picture
    getProfilePicture(): void {
      this.authService.getProfilePicture(this.user.id)
        .subscribe({
          next: (blob) => {
            const reader = new FileReader();
            reader.onload = () => this.previewUrl = reader.result;
            reader.readAsDataURL(blob);
            console.log(reader.readAsDataURL(blob));
          },
          error: (error) => {
            // console.error('Error fetching profile picture:', error);
            this.message.error(`Error fetching profile picture ${error.message}`);
          }
        });
    }
}
