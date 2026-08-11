import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
export declare const createChallan: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getChallans: (req: Request, res: Response) => Promise<void>;
export declare const getChallanById: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=challanController.d.ts.map