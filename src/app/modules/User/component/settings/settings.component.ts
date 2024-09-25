import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../auth/services/auth/auth.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StorageService } from '../../../../auth/services/storage/storage.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit{
  selectedFile: File | null = null;
  user = StorageService.getUser(); 
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private authService: AuthService,
    private message:NzMessageService,
    private router: Router,
  ) { }

 ngOnInit(): void {
    // Fetch and display the profile picture on component initialization
    this.getProfilePicture();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.getProfilePicture();
      }
    });
  }

  // Handle file input change event
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result;
      reader.readAsDataURL(file);
    }
  }

  // Upload the profile picture
  uploadProfilePicture(): void {
    if (this.selectedFile) {
      this.authService.uploadProfilePicture(this.user.id, this.selectedFile)
        .subscribe({
          next: (response) => {
            console.log(response);
            this.message.success('Profile picture uploaded successfully!');
          },
          error: (error) => {
            console.error('Error uploading profile picture:', error);
            this.message.error(`Error uploading profile picture ${error.message}`);
          }
        });
    }
  }

  // Fetch and display the profile picture
  getProfilePicture(): void {
    this.authService.getProfilePicture(this.user.id)
      .subscribe({
        next: (blob) => {
          const reader = new FileReader();
          reader.onload = () => this.previewUrl = reader.result;
          reader.readAsDataURL(blob);
        },
        error: (error) => {
          // console.error('Error fetching profile picture:', error);
          this.message.error(`Error fetching profile picture ${error.message}`);
        }
      });
  }
}
