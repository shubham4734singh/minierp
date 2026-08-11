# MiniERP 🚀

MiniERP is a full-stack Enterprise Resource Planning solution tailored for small and medium-sized businesses. It includes a beautiful React frontend and a robust Node.js backend.

## 🌟 Features

- **Product & Inventory Management**: Track stock levels, SKUs, and categories.
- **Customer Management**: Manage retail, wholesale, and distributor details.
- **Sales Challans**: Generate, confirm, and export sales challans as PDFs.
- **Interactive Dashboard**: View real-time analytics and statistics.
- **Role-based Authentication**: Secure JWT-based access for Admin and Staff users.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express, Prisma (ORM), PostgreSQL (Supabase), Zod, PDFKit.
- **Deployment**: Configured out of the box for serverless deployment on Vercel.

## 🔗 Live Demo & API Documentation

- **Frontend**: [Available upon deployment on Vercel]
- **API Swagger Docs**: `/api-docs` (Append this route to your deployed backend URL or view locally)

> **Note**: To test the APIs using Swagger, visit `/api-docs` on your live domain or `http://localhost:5000/api-docs` locally.

## 🚀 Local Development Setup

### 1. Database Setup
1. Create a PostgreSQL project on [Supabase](https://supabase.com/).
2. Get your connection string (Session pooled URI) from Supabase dashboard.

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
DATABASE_URL="your-supabase-connection-string"
JWT_SECRET="super-secret-key-for-dev"
PORT=5000
```

Initialize the database:
```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts # Creates default admin user
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL="http://localhost:5000/api"
```

Start the frontend:
```bash
npm run dev
```

### Default Login
- **Email**: `admin@erp.com`
- **Password**: `admin123`

## 📦 Deployment (Vercel)

The project includes a `vercel.json` configured to host both the Vite frontend and Express backend on a single Vercel project seamlessly.

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Ensure the **Framework Preset** is set to `Vite`.
4. Add the `DATABASE_URL` and `JWT_SECRET` environment variables in Vercel.
5. Deploy!

*Ensure you run `npx tsx prisma/seed.ts` locally connected to your production database to create the initial admin user.*
