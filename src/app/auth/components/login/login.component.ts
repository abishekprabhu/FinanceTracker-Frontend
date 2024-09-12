import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';

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
      // Handle form login here
      this.isSpinning = true;
      console.log('Form Submitted', this.loginForm.value);
      this.authService.login(this.loginForm.value).subscribe({
        next:(res)=> {
          this.message.success("Sign up Successful!",{nzDuration:5000});
          console.log(res);
          this.router.navigateByUrl("/user/dashboard");
        },
        error:(err) => {
          this.message.error(`Login Unsuccessful.\n ${err.message}`, { nzDuration: 5000 });
        }
      })
      this. isSpinning = false;
    }
  }

}
