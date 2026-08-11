import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

import authRoutes from './routes/authRoutes';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import challanRoutes from './routes/challanRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import userRoutes from './routes/userRoutes';
import auditLogRoutes from './routes/auditLogRoutes';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
// Removed http and socket

// Swagger Documentation
import { swaggerDocument } from './swagger';
app.get('/api/swagger.json', (req: Request, res: Response) => {
  res.json(swaggerDocument);
});
app.get('/api/docs', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>MiniERP Swagger UI</title>
      <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js" crossorigin></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api/swagger.json',
            dom_id: '#swagger-ui',
          });
        };
      </script>
    </body>
    </html>
  `);
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'API is running beautifully!' });
});

// Export for Vercel Serverless Functions
export default app;
