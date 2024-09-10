import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  loginForm: FormGroup;
  passwordVisible = false;
  isSpinning : boolean = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({      
      email: ['', [Validators.required, Validators.email]],      
      password: ['', [Validators.required]]      
    });
  }

  ngOnInit(): void {
    
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      // Handle form submission here
      this.isSpinning = true;
      console.log('Form Submitted', this.loginForm.value);
    }
  }

}
