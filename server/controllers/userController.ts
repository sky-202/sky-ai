import prisma from "../config/prisma";
import type { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();

        if (!users) {
            return res.json({ status: 404, message: "No user exists in the table/relation" });
        }

        return res.status(200).json({
            success: true,
            data: {users}
        })  
    } catch (error) {
        const errorMessage = error instanceof Error;
        return res.status(500).json({
            success: false,
            message: errorMessage,
        })
    }    
};

export const getUser = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.id);
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            }
        });

        if (!user) {
            return res.json({ status: 404, message: "User does not exists." });
        }

        return res.status(200).json({
            success: true,
            data: {user}
        })  
    } catch (error) {
        const errorMessage = error instanceof Error;
        return res.status(500).json({
            success: false,
            message: errorMessage,
        })
    }    
};
