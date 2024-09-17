import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../auth/services/storage/storage.service';
import { NavigationEnd, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrl: './sider.component.css'
})
export class SiderComponent implements OnInit{
  isCollapsed = false;
  isLoggedIn = false;

  constructor(
    private router: Router,
    private message : NzMessageService
  ){ }

  ngOnInit(): void {
    // Check if the user is logged in
    this.isLoggedIn = StorageService.isCustomerLoggedIn();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoggedIn = StorageService.isCustomerLoggedIn();
      }
    });
  }

  user = StorageService.getUser();
  

  signout(){
        // Clear the session and redirect to login
    StorageService.signout();
    this.isLoggedIn = false;
    this.message.success("Logout Successful.");
    this.router.navigateByUrl("/login");
  }
}
