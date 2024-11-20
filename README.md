# Personal Expense Tracker

## Overview

This project is a **Personal Expense Tracker** web application built using **Angular** for the frontend, **Spring Boot** for the backend, and **MySQL** as the database. It allows users to manage their finances by adding incomes, expenses, and wallets, generating reports, and exporting invoices. The app also integrates with **Razorpay** for bill payments and online wallet top-ups.

---

## Features

- **User Authentication:** Secure login and registration functionality.
- **Income & Expense Management:** Add, categorize, and track income/expenses.
- **Wallet Functionality:** Manage wallet balance and pay bills using wallet funds.
- **Real-time Notifications:** Broadcast notifications via **WebSocket**.
- **Financial Reports:** Pie charts and graphs to visualize income vs. expenses.
- **PDF Export & Screenshots:** Export reports to PDF using **jspdf** and **html2canvas**.
- **Charting Support:** Visual data presentation using **Chart.js** and **ng2-charts**.
- **Payment Integration:** Razorpay integration for online payments.
- **UI Components:** Responsive design using **ng-zorro-antd**.

---

## Tech Stack

### Frontend:

- **Angular**: UI development
- **ng-zorro-antd**: UI components
- **Chart.js / ng2-charts**: Data visualization
- **rxjs**: Reactive programming
- **stompjs / sockjs-client**: WebSocket communication

### Backend:

- **Spring Boot**: REST API
- **MySQL**: Database for storing user, income, and transaction data

---

## Prerequisites

Ensure the following tools are installed on your system:

- **Node.js**: Version 16.x or above
- **Angular CLI**: `npm install -g @angular/cli`
- **Java**: JDK 17 or above
- **Maven**: For building Spring Boot backend
- **MySQL**: Running MySQL instance with credentials set

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/abishekprabhu/FinanceTracker-Frontend.git
git clone https://github.com/abishekprabhu/FinanceTracker-BackEnd.git
cd expense-tracker
```

### 2. Frontend (Angular)

1. Navigate to the Angular folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Angular development server:

   ```bash
   ng serve
   ```

4. Open the application in a browser:
   ```
   http://localhost:4200
   ```

### 3. Backend (Spring Boot)

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Update **application.properties** with your MySQL credentials:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/expense_tracker
   spring.datasource.username=your-username
   spring.datasource.password=your-password
   ```

3. Build and run the backend:

   ```bash
   ./mvnw spring-boot:run
   ```

4. The backend will be available at:
   ```
   http://localhost:8080
   ```

---

## Usage

1. **Register and Login:** Create an account and log in.
2. **Manage Finances:** Add income and expenses with relevant categories.
3. **Wallet:** Add money to the wallet or pay bills using the balance.
4. **Generate Reports:** View charts and export data as PDF.
5. **Notifications:** Receive real-time notifications for transactions.

---

## Libraries and Dependencies

| Library            | Version | Purpose                                   |
| ------------------ | ------- | ----------------------------------------- |
| **@stomp/stompjs** | 7.0.0   | WebSocket communication for notifications |
| **chart.js**       | 4.4.4   | Data visualization charts                 |
| **file-saver**     | 2.0.5   | Save files locally                        |
| **html2canvas**    | 1.4.1   | Convert HTML to canvas for screenshots    |
| **jspdf**          | 2.5.2   | Generate PDFs                             |
| **ng-zorro-antd**  | 17.4.1  | UI components for Angular                 |
| **ng2-charts**     | 6.0.1   | Angular wrapper for Chart.js              |
| **rxjs**           | ~7.8.0  | Reactive programming in Angular           |
| **sockjs-client**  | 1.6.1   | WebSocket fallback support                |
| **stompjs**        | 2.3.3   | Legacy STOMP client                       |

---

## Deployment

1. **Frontend on Netlify:**

   - Build Angular for production:
     ```bash
     ng build --prod
     ```
   - Deploy the `dist/` folder on [Netlify](https://www.netlify.com/).

2. **Backend on Render:**

   - Push the Spring Boot backend to GitHub.
   - Connect the repository to [Render](https://render.com/) and deploy as a web service.

3. **Database:**
   - Use **Planetscale** or **FreeRemoteMySQL** to host the MySQL database.

---

## WebSocket Configuration

To enable real-time notifications, make sure the backend allows CORS requests from your frontend URL:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
            .allowedOrigins("*")//https://your-frontend.netlify.app
            .allowedMethods("*");
  }
}
```

---

## Razorpay Integration

Make sure to update your Razorpay credentials in the backend:

```java
public class PaymentService {
  private static final String RAZORPAY_KEY = "your-razorpay-key";
  private static final String RAZORPAY_SECRET = "your-razorpay-secret";
}
```

---

## Screenshots

1. **Dashboard:**  
   Displaying income, expense, and wallet summary charts.

2. **Wallet Top-up:**  
   Razorpay integration for seamless payment processing.

3. **Notification Panel:**  
   Real-time notifications for transactions.

---

## Contributing

Feel free to submit issues or pull requests if you have ideas for improvement or bug fixes.

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Contact

For any questions or support, contact [abiskanna@gmail.com](mailto:abiskanna@gmail.com).
