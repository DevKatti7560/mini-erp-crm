# 🚀 Mini ERP & CRM

<p align="center">

<img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
<img src="https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/Express.js-Backend-000000?style=for-the-badge&logo=express&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />

</p>

<p align="center">

<img src="https://img.shields.io/badge/JWT-Authentication-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" />
<img src="https://img.shields.io/badge/Vite-Frontend-646CFF?style=flat-square&logo=vite&logoColor=white" />
<img src="https://img.shields.io/badge/REST%20API-Backend-FF6F00?style=flat-square" />
<img src="https://img.shields.io/badge/RBAC-Role%20Based%20Access-8E44AD?style=flat-square" />

</p>

<p align="center">
  <b>A modern full-stack Mini ERP & CRM system for managing customers, products, inventory, stock movements, and sales challans.</b>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-technology-stack">Tech Stack</a> •
  <a href="#-application-workflow">Workflow</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-api-overview">API</a>
</p>

---

## 📌 Overview

**Mini ERP & CRM** is a full-stack business management application designed to demonstrate real-world enterprise application development.

The system combines **Customer Relationship Management (CRM)** and **Enterprise Resource Planning (ERP)** functionality into a single application.

It provides modules for:

* 👥 Customer management
* 📦 Product management
* 📊 Inventory tracking
* 🔄 Stock movement auditing
* 🧾 Sales challan management
* 🔐 JWT authentication
* 🛡️ Role-based access control
* 📈 Business dashboard
* ⚠️ Low-stock monitoring
* ✅ Business-rule validation

The project focuses on building a reliable end-to-end workflow rather than only creating CRUD interfaces.

---

# ✨ Key Features

## 🔐 Authentication & Authorization

* User login
* JWT-based authentication
* Protected frontend routes
* Role-based UI
* Backend authorization middleware
* Role-aware actions

Supported roles include:

```text
ADMIN
SALES
INVENTORY
```

---

## 📊 Business Dashboard

The dashboard provides a centralized overview of the application.

### Dashboard includes:

* Total customers
* Total products
* Total inventory stock
* Total challans
* Confirmed challans
* Draft challans
* Low-stock alerts
* Recent challans
* Recent inventory movements

The dashboard uses live API data instead of static values.

---

## 👥 Customer CRM

The CRM module allows users to manage customer information.

### Features:

* Add customers
* Edit customers
* Search customers
* View customer details
* Customer notes
* Follow-up management
* Customer activity timeline

---

## 📦 Product Management

The product module manages the organization's product catalog.

### Features:

* Create products
* Edit products
* Search products
* Product SKU management
* Category management
* Pricing
* Current stock
* Minimum stock level
* Low-stock identification

---

## 📦 Inventory Management

The inventory module provides visibility into stock activity.

### Features:

* Stock IN
* Stock OUT
* Current stock tracking
* Low-stock monitoring
* Stock movement history
* Movement type filtering
* Search by product/SKU/reason
* Created-by tracking
* Timestamped movements

---

## 🧾 Sales Challans

The Sales Challan module handles the sales dispatch workflow.

### Workflow:

```text
Create Challan
      ↓
Select Customer
      ↓
Add Products
      ↓
Save as Draft
      ↓
Review
      ↓
Confirm Challan
      ↓
Update Product Stock
      ↓
Create OUT Stock Movements
```

### Features:

* Create challan
* Select customer
* Add multiple products
* Quantity management
* Draft challans
* Challan confirmation
* Challan details
* Challan cancellation
* Automatic inventory updates

---

# 🛡️ Business Rules

The application implements important business rules instead of treating the system as simple CRUD.

### Draft Challan

Creating a draft challan does **not** reduce inventory.

```text
Stock = 50

Create Draft
      ↓
Stock = 50
```

### Confirmed Challan

When the challan is confirmed:

```text
Stock = 50
      ↓
Challan Quantity = 5
      ↓
Stock = 45
```

### Negative Stock Protection

The system prevents users from removing more stock than available.

```text
Available Stock = 20

Requested OUT = 100

❌ Insufficient stock

Stock remains = 20
```

### Inventory Audit Trail

Every stock movement is recorded:

```text
Product
SKU
Movement Type
Quantity
Reason
Created By
Date & Time
```

---

# 🏗️ Application Architecture

```text
┌──────────────────────────────┐
│          React UI            │
│                              │
│ Dashboard                    │
│ Customers                    │
│ Products                     │
│ Inventory                    │
│ Sales Challans               │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│       Node.js + Express      │
│                              │
│ Routes                       │
│ Controllers                  │
│ Middleware                   │
│ Authentication              │
│ Authorization                │
│ Business Logic               │
└──────────────┬───────────────┘
               │
               │ Prisma ORM
               ▼
┌──────────────────────────────┐
│         PostgreSQL           │
│                              │
│ Users                        │
│ Customers                    │
│ Products                     │
│ Challans                     │
│ Stock Movements              │
└──────────────────────────────┘
```

---

# 🧰 Technology Stack

## Frontend

| Technology      | Purpose                   |
| --------------- | ------------------------- |
| React           | User interface            |
| JavaScript      | Application logic         |
| React Router    | Client-side routing       |
| Axios           | API communication         |
| Vite            | Development/build tooling |
| React Hot Toast | Notifications             |

## Backend

| Technology | Purpose                            |
| ---------- | ---------------------------------- |
| Node.js    | Server runtime                     |
| Express.js | REST API framework                 |
| JWT        | Authentication                     |
| Middleware | Authorization & request protection |

## Database

| Technology        | Purpose                    |
| ----------------- | -------------------------- |
| PostgreSQL        | Relational database        |
| Prisma            | ORM & database access      |
| Prisma Migrations | Database schema management |

---

# 📂 Project Structure

```text
mini-erp-crm/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── CustomerDetails.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Challans.jsx
│   │   │   ├── CreateChallan.jsx
│   │   │   └── ChallanDetails.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── utils/
│   │   │   └── permissions.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── screenshots/
│
├── .gitignore
├── LICENSE
├── README.md
└── package.json
```

---

# 🔄 Application Workflow

## Customer Management

```text
Login
 ↓
Dashboard
 ↓
Customers
 ↓
Create / Search / Edit
 ↓
Customer Details
 ↓
Notes & Follow-ups
```

## Inventory Workflow

```text
Products
 ↓
Stock IN / OUT
 ↓
Validate Quantity
 ↓
Update Product Stock
 ↓
Create Stock Movement
 ↓
Inventory Audit Trail
```

## Sales Workflow

```text
Customer
   ↓
Create Challan
   ↓
Add Products
   ↓
Save Draft
   ↓
Confirm
   ↓
Validate Stock
   ↓
Database Transaction
   ↓
Update Stock
   ↓
Create OUT Movements
```

---

# 📸 Screenshots

## 🔐 Login

![Login](screenshots/01-login.png)

---

## 📊 Dashboard

![Dashboard](screenshots/02-dashboard.png)

---

## 👥 Customer Management

![Customers](screenshots/03-customers.png)

---

## 👤 Customer Details

![Customer Details](screenshots/04-customer-details.png)

---

## 📦 Product Management

![Products](screenshots/05-products.png)

---

## 📥📤 Stock Management

![Stock Management](screenshots/06-stock-management.png)

---

## 🔄 Inventory Movements

![Inventory Movements](screenshots/07-inventory-movements.png)

---

## 🧾 Sales Challans

![Sales Challans](screenshots/08-challans.png)

---

## ➕ Create Challan

![Create Challan](screenshots/09-create-challan.png)

---

## 📄 Challan Details

![Challan Details](screenshots/10-challan-details.png)

---

## 🛡️ Negative Stock Validation

![Negative Stock Validation](screenshots/11-negative-stock-validation.png)

---

# 🚀 Installation

## 1. Clone the repository

```bash
git clone https://github.com/DevKatti7560/mini-erp-crm.git

cd mini-erp-crm
```

## 2. Install frontend dependencies

```bash
cd client

npm install
```

## 3. Install backend dependencies

Open another terminal:

```bash
cd server

npm install
```

---

# 🔑 Environment Variables

Create:

```text
server/.env
```

Example:

```env
PORT=5000

DATABASE_URL="your-postgresql-connection-string"

JWT_SECRET="your-secret-key"
```

Never commit your `.env` file.

---

# 🗄️ Database Setup

From the server directory:

```bash
npx prisma migrate dev
```

Generate the Prisma client:

```bash
npx prisma generate
```

---

# ▶️ Run the Application

## Start backend

```bash
cd server

npm run dev
```

Backend:

```text
http://localhost:5000
```

## Start frontend

Open another terminal:

```bash
cd client

npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔌 API Overview

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

## Customers

```text
GET    /api/customers
POST   /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
```

## Products

```text
GET    /api/products
POST   /api/products
GET    /api/products/:id
PUT    /api/products/:id
DELETE /api/products/:id
```

## Inventory

```text
GET  /api/products/movements
POST /api/products/:id/stock
```

## Challans

```text
GET  /api/challans
POST /api/challans
GET  /api/challans/:id
POST /api/challans/:id/confirm
POST /api/challans/:id/cancel
```

> Endpoint availability and exact request/response structures should be verified against the current backend implementation.

---

# 🧪 Validation & Reliability

The application includes validation for:

* Required fields
* Product quantities
* Stock availability
* Challan contents
* Invalid records
* Unauthorized operations
* API failures
* Empty datasets

The frontend also provides:

* Loading states
* Empty states
* Error messages
* Success notifications
* Responsive layouts

---

# 🔐 Security Considerations

The application uses:

* JWT-based authentication
* Protected frontend routes
* Backend authentication middleware
* Role-based authorization
* Environment variables for secrets
* Server-side business-rule validation

Frontend permission checks are used for user experience, while backend authorization remains the actual security boundary.

---

# 🎯 Project Goals

This project was developed to demonstrate practical full-stack engineering skills including:

* REST API development
* React application architecture
* Database modeling
* Authentication
* Authorization
* CRUD operations
* Inventory/business logic
* Database transactions
* API integration
* Responsive UI development
* Error handling
* Enterprise-style workflows

---

# 🚧 Future Improvements

Possible future enhancements include:

* Advanced analytics
* PDF challan generation
* Email notifications
* Customer activity reports
* Inventory forecasting
* Advanced search and filtering
* Export to Excel/CSV
* Deployment with CI/CD
* Automated unit and integration testing

---

# 👨‍💻 Author

## Devaraja Katti

**AI & ML Engineering Student • Full Stack Developer • Machine Learning Enthusiast**

<p>
<a href="https://github.com/DevKatti7560">
<img src="https://img.shields.io/badge/GitHub-DevKatti7560-181717?style=for-the-badge&logo=github" />
</a>
<a href="https://www.linkedin.com/in/devaraja-katti-58136a2a1/">
<img src="https://img.shields.io/badge/LinkedIn-Devaraja%20Katti-0A66C2?style=for-the-badge&logo=linkedin" />
</a>
</p>

---

# ⭐ Project Highlights

```text
✔ Full-stack JavaScript application
✔ React + Node.js + Express
✔ PostgreSQL + Prisma
✔ JWT authentication
✔ Role-based authorization
✔ Customer CRM
✔ Product management
✔ Inventory management
✔ Stock movement auditing
✔ Sales challan workflow
✔ Transactional stock updates
✔ Business-rule validation
✔ Responsive UI
```

---

<p align="center">

### ⭐ If you found this project interesting, consider giving it a star!

</p>

<p align="center">
Built with ❤️ using JavaScript and modern full-stack technologies.
</p>
