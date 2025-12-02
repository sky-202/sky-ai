import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';
import type { Request, Response, NextFunction} from 'express';
import { JWT_SECRET } from '../config/env.config';
import { json } from 'stream/consumers';

// yet to understand how this works and where else we can use this 
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authorize = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token;
        
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }else if (req.headers.authorization && req.headers.authorization.startsWith("bearer")) {
            token = req.headers.authorization.split(' ')[1]
        }

        if(!token) {
            return res.status(401).json({message: "Unauthorised"});
        }

        const decoded = jwt.verify(token,JWT_SECRET as string) as { userId: string };

        const user = await prisma.user.findUnique({ where: { id: parseInt(decoded.userId, 10) } })

        req.user = user;

        next();

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "unauthorized token";
        res.status(401).json({message: "Unauthorized", error: errorMessage})
    }
}