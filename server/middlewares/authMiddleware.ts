import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import type { Request, Response, NextFunction} from 'express';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    
}