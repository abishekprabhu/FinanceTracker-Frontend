import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

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

// Custom validator function to check if password and confirm password match
function confirmPasswordValidator(control: AbstractControl): { [key: string]: boolean } | null {
  if (!control.parent) {
    return null;
  }
  const password = control.parent.get('password');
  const confirmPassword = control;

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { 'mismatch': true };
  } else {
    return null;
  }
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(15), Validators.minLength(6), Validators.pattern(/^[a-zA-Z ]*$/)]],
    email: ['', [Validators.required, Validators.email]], 
    mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/), Validators.maxLength(10)]],
    password: ['', [Validators.required, Validators.minLength(8), passwordValidator]],
    confirmPassword: ['', [Validators.required, confirmPasswordValidator]]
  });;
  passwordVisible = false;
  isSpinning : boolean = false; 
  
  constructor(
    private fb: FormBuilder,
    private authService : AuthService,
    private message : NzMessageService,
    private router : Router   
  ) { }
// Prevent non-numeric input in the mobile number field
validateNumber(event: KeyboardEvent): boolean {
  const key = event.key;  
  // Allow only numeric input (0-9)
  if (!/^[0-9]$/.test(key)) {
    event.preventDefault();
    return false;
  }  
  return true;
}

  ngOnInit(): void {
    this.signupForm;
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      // Handle form submission here
      this.isSpinning = true;
      console.log('Form Submitted', this.signupForm.value);
      this.authService.signup(this.signupForm.value).subscribe({
        next:(res)=> {
          this.message.success("Sign up Successful!",{nzDuration:5000});
          console.log(res);
          this.router.navigateByUrl("/login");
        },
        error:(err) => {
          this.message.error(`Sign up Unsuccessful: ${err.message}`, { nzDuration: 5000 });
        }
      });
      this. isSpinning = false;
    }
  }
}
