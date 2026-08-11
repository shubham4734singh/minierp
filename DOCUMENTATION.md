# Comprehensive Project Documentation: MiniERP System

## 1. Executive Summary

The MiniERP system is a full-stack, enterprise-grade application engineered to streamline business operations for small and medium-sized enterprises. The platform centralizes critical business workflows, including robust inventory management, multi-tier customer relationship management (CRM), and end-to-end sales challan processing. It provides a secure, role-based environment that facilitates data integrity and operational efficiency across different administrative and staff layers.

**Live Project URL:** [https://minierp.shubhamcybersky.in/](https://minierp.shubhamcybersky.in/)

---

## 2. System Architecture

The application adopts a modern, decoupled client-server architecture, ensuring high scalability, modularity, and separation of concerns.

### 2.1 Frontend Architecture
- **Framework:** React.js bootstrapped with Vite for optimized build times and Hot Module Replacement (HMR).
- **Language:** TypeScript, providing strict static typing to catch runtime errors during compilation.
- **Styling:** Tailwind CSS, utilized for utility-first, responsive interface design without bloated external stylesheets.
- **State Management:** React Context API, handling global state for authentication tokens and user session data.
- **HTTP Client:** Axios, configured with request interceptors to automatically append JSON Web Tokens (JWT) to protected API calls.
- **Routing:** React Router DOM, managing client-side navigation and protected route wrappers.

### 2.2 Backend Architecture
- **Runtime Environment:** Node.js.
- **Framework:** Express.js, providing a minimal, unopinionated routing and middleware framework.
- **Language:** TypeScript, mirroring the frontend to maintain full-stack type safety.
- **Database ORM:** Prisma Client, enabling type-safe database queries and seamless schema migrations.
- **Database Provider:** PostgreSQL, hosted on Supabase to ensure high availability and connection pooling via PgBouncer.
- **Validation Layer:** Zod, utilized for strict runtime validation of incoming HTTP request payloads.
- **Security Middleware:** Helmet (for HTTP header security) and CORS (for Cross-Origin Resource Sharing policies).

---

## 3. Database Schema and Entity Relationships

The relational database is structured to maintain strict referential integrity across interconnected entities.

### 3.1 User Entity
- **Purpose:** Manages system access and authentication.
- **Fields:** `id` (UUID), `name`, `email` (Unique), `password` (Hashed), `role` (Enum), `createdAt`, `updatedAt`.
- **Roles:** `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.

### 3.2 Product Entity
- **Purpose:** Central repository for inventory items.
- **Fields:** `id` (UUID), `name`, `sku` (Unique Stock Keeping Unit), `category`, `unitPrice`, `currentStock`.
- **Relationships:** One-to-Many with `StockMovement` and `ChallanItem`.

### 3.3 Stock Movement Entity
- **Purpose:** Acts as an immutable ledger for inventory adjustments.
- **Fields:** `id` (UUID), `productId` (Foreign Key), `quantity`, `type` (`IN` or `OUT`), `reason`, `userId` (Foreign Key).

### 3.4 Customer Entity
- **Purpose:** Maintains client details and sales history.
- **Fields:** `id` (UUID), `name`, `mobile`, `email`, `type` (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), `address`, `followUpDate`.
- **Relationships:** One-to-Many with `SalesChallan`.

### 3.5 Sales Challan Entity
- **Purpose:** Represents a formal sales order or delivery document.
- **Fields:** `id` (UUID), `challanNumber` (Auto-generated, Unique), `customerId` (Foreign Key), `status` (`DRAFT`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`), `totalAmount`, `createdById`.
- **Relationships:** One-to-Many with `ChallanItem`.

### 3.6 Challan Item Entity
- **Purpose:** Normalizes the many-to-many relationship between Products and Sales Challans.
- **Fields:** `id` (UUID), `challanId` (Foreign Key), `productId` (Foreign Key), `quantity`, `unitPrice`, `totalPrice`.

---

## 4. Detailed Module Specifications

### 4.1 Authentication and Security Module
The system implements a stateless authentication mechanism.
- **Registration & Hashing:** User passwords are encrypted using `bcryptjs` with a computational salt cost of 10 rounds before being persisted to the database.
- **Token Issuance:** Upon successful authentication, the backend issues an RSA-signed JSON Web Token (JWT) containing the user's UUID and role, valid for 24 hours.
- **Authorization Middleware:** Protected routes implement a middleware function that extracts the JWT from the `Authorization: Bearer <token>` header, verifies the signature, and rejects unauthorized access with a `401 Unauthorized` or `403 Forbidden` HTTP status.

### 4.2 Product and Inventory Module
- **Lifecycle Management:** Administrators can define new products with unique SKUs.
- **Ledger-based Stock Tracking:** Stock is not updated directly. Instead, `IN` or `OUT` stock movements are recorded in the `StockMovement` ledger. The system aggregates these movements to calculate the `currentStock`, ensuring an immutable audit trail of who modified the inventory, when, and for what reason.

### 4.3 Customer Relationship Management (CRM) Module
- **Segmentation:** Customers are segmented into Retail, Wholesale, and Distributor categories, allowing for future implementations of dynamic pricing strategies.
- **Follow-up Tracking:** Sales staff can set `followUpDate` timestamps for lead conversion tracking.

### 4.4 Sales Challan and PDF Generation Module
- **Order Pipeline:** A challan progresses through a strict state machine: `DRAFT` -> `CONFIRMED` -> `SHIPPED` -> `DELIVERED`.
- **Inventory Subtraction:** When a challan transitions to `CONFIRMED`, the system automatically triggers a transaction that inserts `OUT` records into the `StockMovement` ledger for every item in the challan, ensuring stock levels are accurately depleted.
- **PDF Export:** The system utilizes `PDFKit` to dynamically stream binary PDF data directly to the client browser, formatting the challan into a printable, standardized invoice document.

---

## 5. Application Programming Interface (API)

The backend exposes a comprehensive RESTful API conforming to OpenAPI 3.0 specifications.

### 5.1 Interactive Documentation
The API documentation is accessible via the live deployment at `/api/docs`. This Swagger UI instance provides a graphical interface detailing request schemas, response models, and required authentication headers. It allows developers to interact with the production database dynamically.

**Live API Documentation:** [https://minierp.shubhamcybersky.in/api/docs](https://minierp.shubhamcybersky.in/api/docs)

### 5.2 Core Endpoints (Summary)
- **Auth:** `POST /api/auth/login`, `POST /api/auth/register`
- **Products:** `GET /api/products`, `POST /api/products`, `GET /api/products/:id`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `POST /api/products/:id/stock`
- **Customers:** `GET /api/customers`, `POST /api/customers`, `GET /api/customers/:id`, `PUT /api/customers/:id`, `DELETE /api/customers/:id`
- **Challans:** `GET /api/challans`, `POST /api/challans`, `GET /api/challans/:id`, `PUT /api/challans/:id/status`, `DELETE /api/challans/:id`, `GET /api/challans/:id/pdf`

### 5.3 Error Handling
All endpoints implement unified error handling.
- **Validation Errors (400):** If Zod schema validation fails, the API responds with a structured array of missing or invalid fields.
- **Not Found (404):** Returned when querying a non-existent UUID.
- **Internal Server Error (500):** Unhandled database exceptions are caught and sanitized to prevent leaking stack traces to the client.

---

## 6. Deployment Strategy

The application is engineered for highly available, serverless deployment on Vercel.

### 6.1 Serverless Configuration
The repository includes a highly configured `vercel.json` file that maps incoming HTTP requests to the appropriate service.
- **Frontend Routing:** All requests excluding `/api/*` are routed to the statically built Vite frontend. Client-side routing is supported by redirecting missing files to `index.html`.
- **Backend Routing:** Requests matching `/api/*` invoke the Express backend, executed within isolated Vercel Serverless Node.js functions.

### 6.2 Continuous Integration
Commits pushed to the `main` branch trigger automated Vercel build pipelines. The pipeline executes `prisma generate` to construct the customized Prisma Client based on the latest database schema, compiles the TypeScript backend, and builds the optimized Vite frontend bundle before atomic deployment.

---

## 7. Development Environment Setup

To initialize the project locally for continued development or evaluation:

1. **Repository Cloning:** Clone the source code and run `npm install` independently within both the `frontend` and `backend` directories.
2. **Environment Configuration:** 
   - Within `backend`, create a `.env` file containing the `DATABASE_URL` (pointing to the PostgreSQL cluster) and a secure `JWT_SECRET`.
   - Within `frontend`, create a `.env` file containing `VITE_API_URL="http://localhost:5000/api"`.
3. **Database Initialization:** Navigate to the `backend` directory and execute `npx prisma generate` followed by `npx prisma db push` to synchronize the relational schema.
4. **Execution:** Launch the backend server using `npm run dev` (running on port 5000), and subsequently launch the frontend server using `npm run dev` (running on port 5173).
