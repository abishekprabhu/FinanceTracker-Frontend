import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup = this.fb.group({      
    email: ['', [Validators.required, Validators.email]],      
    password: ['', [Validators.required]]      
  });
  passwordVisible = false;
  isSpinning : boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService : AuthService,
    private message : NzMessageService,
    private router : Router
  ) { }
  

  ngOnInit(): void {
    this.loginForm;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSpinning = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.id != null) {
            const user = res;
            StorageService.saveUser(user);
            this.message.success("Login Successful!", { nzDuration: 5000 });
          }
          if (StorageService.isCustomerLoggedIn()) {
            console.log("Navigating to dashboard"); // Debugging line
            this.router.navigateByUrl("/user/dashboard");
          }
        },
        error: (err) => {
          this.message.error(`Login Unsuccessful.\n ${err.message}`, { nzDuration: 5000 });
          this.isSpinning = false; 
        },
        complete: () => {
          this.isSpinning = false;  // Ensure spinner stops after completion
        }
      });
    }
  }
  

}
