import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'FinanceTracker-Frontend';
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId); // Check if it's the browser
  }

  ngOnInit(): void {
    console.log('Platform:', this.platformId);
    if (this.isBrowser) {
      console.log('Running in browser');
      this.document.body.classList.add('dark'); // This will only run in the browser
    } else {
      console.log('Running on server');
    }
  }
}
