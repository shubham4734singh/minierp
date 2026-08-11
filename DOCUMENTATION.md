# MiniERP Project Documentation

## 1. Project Overview

MiniERP is a comprehensive, full-stack Enterprise Resource Planning (ERP) application designed to streamline core business operations for small to medium-sized enterprises. The system centralizes product inventory management, customer relationship management, and sales challan generation into a single, cohesive platform. 

The application features a secure, role-based architecture, ensuring that administrative and staff users have appropriate access to sensitive business data.

## 2. System Architecture

The project utilizes a modern, decoupled client-server architecture:

### Frontend
- **Framework:** React with Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **State Management:** React Context API

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database Provider:** PostgreSQL (Supabase)
- **Authentication:** JSON Web Tokens (JWT) and bcryptjs
- **Validation:** Zod

## 3. Core Modules and Features

### 3.1 Authentication and Security
- Secure user registration and login mechanism.
- Password encryption using bcrypt hashing.
- Role-based Access Control (RBAC) supporting predefined roles (Admin, Sales, Warehouse, Accounts).
- JWT-based stateless authentication for API requests.

### 3.2 Product and Inventory Management
- Create, read, update, and delete (CRUD) operations for product catalogs.
- Stock movement tracking (Inward/Outward) with required reasoning.
- Automated current stock calculation based on historical movements.

### 3.3 Customer Management
- Categorized customer profiles (Retail, Wholesale, Distributor).
- Contact information management and follow-up tracking.
- Transaction history linked directly to the customer profile.

### 3.4 Sales and Challan Processing
- Draft and confirm sales challans with multiple line items.
- Status tracking pipeline (Draft, Confirmed, Shipped, Delivered, Cancelled).
- Automatic PDF generation for confirmed challans using PDFKit.

## 4. API Specification

The backend exposes a RESTful API. Comprehensive interactive documentation is generated using OpenAPI/Swagger standards.

**Live API Documentation:** [https://minierp-delta.vercel.app/api/docs](https://minierp-delta.vercel.app/api/docs)

The documentation allows developers and evaluators to interact directly with the backend endpoints, configure authentication headers, and observe request/response payloads in real-time.

## 5. Deployment and Hosting

The application is configured for a unified deployment on the Vercel platform using serverless functions.
- **Frontend Delivery:** Vercel Edge Network
- **Backend Compute:** Vercel Serverless Node.js Functions
- **Database Hosting:** Supabase Managed PostgreSQL

The routing rules are defined in `vercel.json` to seamlessly map frontend routes to the React build and `/api/*` routes to the Express backend.

## 6. Local Setup Instructions

For local evaluation, the repository can be initialized with the following steps:

1. Clone the repository and install dependencies in both the `frontend` and `backend` directories using `npm install`.
2. Configure the `.env` file in the `backend` directory with the `DATABASE_URL` and `JWT_SECRET`.
3. Configure the `.env` file in the `frontend` directory with `VITE_API_URL="http://localhost:5000/api"`.
4. Run `npx prisma generate` and `npx prisma db push` in the backend to initialize the database schema.
5. Start both servers using `npm run dev` in their respective directories.
