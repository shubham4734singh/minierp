# Mini ERP + CRM Operations Portal

A complete Full-Stack solution for a wholesale/distribution company, designed to manage Customers, Products, Stock Movements, and Sales Challans.

## 🚀 Quick Start (Docker)

The absolute fastest way to run this project is using Docker Compose.

1. Start the application:
   ```bash
   docker-compose up --build
   ```
2. The application will be available at:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5000

## 🔑 Test Login Credentials

The following users are pre-configured. **Password for all: `password123`**

- **Admin**: `admin@erp.com`
- **Sales**: `sales@erp.com`
- **Warehouse**: `warehouse@erp.com`
- **Accounts**: `accounts@erp.com`

## 💻 Manual Setup

If you prefer to run it manually without Docker:

### 1. Database
Set up a PostgreSQL database and configure the URL in `backend/.env`.

### 2. Backend
```bash
cd backend
npm install
npx prisma db push
npx prisma generate
npm run seed
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📚 API Testing
A `Mini_ERP_Postman_Collection.json` file is included in the root directory. You can import this into Postman to test the backend API endpoints.
