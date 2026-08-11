import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const getProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProductById: (req: Request, res: Response) => Promise<void>;
export declare const createProduct: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProduct: (req: Request, res: Response) => Promise<void>;
export declare const adjustStock: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=productController.d.ts.map