import { Injectable } from '@angular/core';
import { Client, Stomp } from '@stomp/stompjs';
import { Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';
// import { WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient!: Client;
  private notificationSubject = new Subject<any>();

  constructor() {
    this.connect();
  }

  private connect(): void {
    const socket = new SockJS('http://localhost:8080/ws-notifications'); // Update with your backend URL
    this.stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        this.stompClient.subscribe('/topic/notifications', (message) => {
          if (message.body) {
            this.notificationSubject.next(JSON.parse(message.body));
            console.log('Notification received: ', message.body);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });

    this.stompClient.activate();
  }

  getNotification(): Subject<any> {
    return this.notificationSubject;
  }

  sendNotification(notificationMessage: string): void {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/sendNotification',
        body: notificationMessage,
      });
    } else {
      console.error('WebSocket connection is not established.');
    }
  }

  markAsRead(notificationId: number) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: '/app/markAsRead',
        body: JSON.stringify({ id: notificationId }),
      });
    }
  }
}

// private stompClient: any;
// private notificationSubject = new Subject<string>();

// constructor() { }

// connect() {
//   const socket = new SockJS('http://localhost:8080/ws'); // WebSocket URL
//   this.stompClient = Stomp.over(socket);

//   this.stompClient.connect({}, () => {
//     this.stompClient.subscribe('/topic/notifications', (message: any) => {
//       this.notificationSubject.next(message.body);
//     });
//   }, (error: any) => {
//     console.error('WebSocket connection error: ', error);
//   });
// }

// getNotification(): Observable<string> {
//   return this.notificationSubject.asObservable();
// }

// disconnect() {
//   if (this.stompClient !== null && this.stompClient !== undefined) {
//     this.stompClient.disconnect(() => {
//       console.log('WebSocket disconnected');
//     });
//     this.stompClient = null;
//   }
// }

// private stompClient!: Client;
// notifications: string[] = [];
// private socket$!: WebSocketSubject<any>;
// constructor() {
//   this.connectToWebSocket();
//   this.socket$ = new WebSocketSubject('http://localhost:8080/ws-notifications');
// }

// // Connect to WebSocket server
// connectToWebSocket(): void {
//   const serverUrl = 'http://localhost:8080/ws-notifications';
//   const socket = new SockJS(serverUrl);

//   this.stompClient = new Client({
//     webSocketFactory: () => socket,
//     reconnectDelay: 5000, // Reconnect every 5 seconds if disconnected
//     onConnect: () => {
//       console.log('Connected to WebSocket');

//       // Subscribe to the notification topic
//       this.stompClient.subscribe('/topic/notifications', (message) => {
//         if (message.body) {
//           this.notifications.push(message.body); // Add received message to notifications list
//           console.log('Notification received: ', message.body);
//         }
//       });
//     },
//     onStompError: (frame) => {
//       console.error('Broker reported error: ' + frame.headers['message']);
//       console.error('Additional details: ' + frame.body);
//     }
//   });

//   this.stompClient.activate();
// }

// // Send notification to server
// sendNotification(notificationMessage: string): void {
//   if (this.stompClient && this.stompClient.connected) {
//     this.stompClient.publish({
//       destination: '/app/sendNotification',
//       body: notificationMessage,
//     });
//   } else {
//     console.error('WebSocket connection is not established.');
//   }
// }

// // Get notifications
// getNotifications(): string[] {
//   return this.notifications;
// }

// connect() {
//   return this.socket$;
// }

// markAsRead(notificationId: number) {
//   this.socket$.next({ action: 'markAsRead', id: notificationId });
// }
