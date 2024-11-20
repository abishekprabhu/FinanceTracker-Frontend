import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

function _window(): any {
  // return the global native browser window object

  return window;
}
@Injectable({
  providedIn: 'root',
})
export class RazorpayService {
  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  get nativeWindow(): any {
    if (isPlatformBrowser(this.platformId)) {
      return _window();
    }
  }
  loadScript(): Observable<void> {
    return new Observable<void>((observer) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        observer.next();
        observer.complete();
      };
      document.body.appendChild(script);
    });
  }
}
