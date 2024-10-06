import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageService } from '../../auth/services/storage/storage.service';
import { NavigationEnd, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import {
  AbstractControl,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';
import { AuthService } from '../../auth/services/auth/auth.service';
import { WebSocketService } from '../../modules/User/Service/WebSocket/web-socket.service';
import path from 'path';
import { pathToFileURL } from 'url';

// Custom validator function for password strength
function passwordValidator(
  control: AbstractControl
): { [key: string]: boolean } | null {
  const value = control.value;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(value);

  if (hasUpper && hasLower && hasNumber && hasSpecial) {
    return null;
  } else {
    return { pattern: true };
  }
}
@Component({
  selector: 'app-sider',
  templateUrl: './sider.component.html',
  styleUrl: './sider.component.css',
})
export class SiderComponent implements OnInit {
  isCollapsed = false;
  isLoggedIn = StorageService.isCustomerLoggedIn();
  isVisibleMiddle = false;
  passwordVisible = false;
  isSpinning: boolean = false;
  isReaderBusy = false; // Add a flag to track if FileReader is busy

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private message: NzMessageService,
    private websocketService: WebSocketService
  ) {}
  // ngOnDestroy(): void {
  //     this.websocketService.disconnect();
  // }
  user = StorageService.getUser();

  resetPasswordForm: FormGroup = this.fb.group({
    email: [{ value: '', disabled: true }],
    oldPassword: ['', [Validators.required]],
    newPassword: [
      '',
      [Validators.required, Validators.minLength(8), passwordValidator],
    ],
  });

  ngOnInit(): void {
    // Check if the user is logged in
    // this.isLoggedIn = StorageService.isCustomerLoggedIn();
    // Listen for navigation events
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isLoggedIn = StorageService.isCustomerLoggedIn();
        // console.log('event' + this.isLoggedIn);
        // console.log(this.user);
      }
    });
    // Fetch user if logged in
    if (this.isLoggedIn) {
      this.user = StorageService.getUser();
      if (this.user) {
        // If the user object exists, patch the form with the user email
        this.resetPasswordForm.patchValue({ email: this.user.email });
        this.getProfilePicture();
        // this.websocketService.connect();
        // this.getNotification();
        this.websocketService.getNotification().subscribe((notification) => {
          this.notifications.push(notification);
          if (!notification.read) {
            this.unreadNotifications++;
            this.playNotificationSound();
          }
        });
      }
    }
  }

  signout() {
    // Clear the session and redirect to login
    StorageService.signout();
    this.isLoggedIn = false;
    this.message.success('Logout Successful.');
    this.handleOkTop();
    this.router.navigateByUrl('/login');
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

  isVisibleTop = false;

  showModalTop(): void {
    this.isVisibleTop = true;
  }

  handleOkTop(): void {
    this.isVisibleTop = false;
  }

  handleCancelTop(): void {
    this.isVisibleTop = false;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      // Enable the email field to include it in the form submission
      this.resetPasswordForm.get('email')?.enable();

      this.isSpinning = true;
      console.log('Form Submitted', this.resetPasswordForm.value);

      this.authService.resetPassword(this.resetPasswordForm.value).subscribe({
        next: (res) => {
          this.message.success('Password Reset Successful!', {
            nzDuration: 6000,
          });
          console.log(res);
          this.handleOkMiddle();
          this.signout();
        },
        error: (err) => {
          this.message.error(`Password Reset Unsuccessful: ${err.message}`, {
            nzDuration: 5000,
          });
        },
      });

      this.isSpinning = false;

      // Disable the email field again after submission
      this.resetPasswordForm.get('email')?.disable();
    }
  }

  previewUrl: string | ArrayBuffer | null = null;
  // Fetch and display the profile picture
  getProfilePicture(): void {
    if (this.isReaderBusy) {
      console.log(
        'Reader is busy, wait for the previous operation to complete.'
      );
      return;
    }
    this.authService.getProfilePicture(this.user.id).subscribe({
      next: (blob) => {
        const reader = new FileReader();

        // Set the flag to true when starting the read operation
        this.isReaderBusy = true;

        reader.onload = () => {
          this.previewUrl = reader.result;
          // Set the flag back to false when reading is done
          this.isReaderBusy = false;
        };

        // Handle error case if the reader fails
        reader.onerror = () => {
          console.error('Error reading the blob.');
          this.isReaderBusy = false;
        };

        reader.readAsDataURL(blob); // Read the blob
      },
      error: (error) => {
        this.message.error(`Error fetching profile picture: ${error.message}`);
      },
    });
  }

  // notifications : string[] = [];
  // unreadCount = 0 ;

  // getNotification(): void {
  //   this.websocketService.getNotification().subscribe({
  //     next: (message: string) => {
  //       console.log(message);
  //       this.notifications.push(message);
  //       this.unreadCount++;
  //     },
  //     error: (err: any) => {
  //       console.error('Error receiving notifications:', err);
  //     }
  //   });
  // }

  // markAllAsRead(): void {
  //   this.unreadCount = 0;
  // }
  // notificationMessage: string = '';
  // notifications: string[] = [];

  // sendNotification() {
  //   if (this.notificationMessage.trim()) {
  //     this.websocketService.sendNotification(this.notificationMessage);
  //     this.notificationMessage = ''; // Clear input after sending
  //   }
  // }

  notifications: any[] = [];
  unreadNotifications: number = 0;
  showNotifications: boolean = false;

  //   pushNotification(){
  //     // this.websocketService.connect().subscribe((notification) => {
  //     //   this.notifications.push(notification);
  //     //   if (!notification.read) {
  //     //     this.unreadNotifications++;
  //     //   }
  //     // });

  //     this.websocketService.getNotification().subscribe((notification) => {
  //       this.notifications.push(notification);
  //       if (!notification.read) {
  //         this.unreadNotifications++;
  //       }
  //     });
  // }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  //   markAsRead(notification:any) {
  //     if (!notification.read) {
  //     notification.read = true;
  //     this.unreadNotifications--;
  //     // this.websocketService.markAsRead(notification.id);  // Inform backend
  //   }
  // }
  markAsRead(notification: any) {
    console.log('Before:', this.unreadNotifications);
    if (!notification.read) {
      notification.read = true;
      this.unreadNotifications--;
      console.log('After:', this.unreadNotifications);
    }
  }

  private playNotificationSound() {
    const audio = new Audio(
      '/assets/img/Sound/mixkit-software-interface-start-2574.wav'
    );
    audio.play();
  }
}
