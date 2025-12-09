import prisma from "../config/prisma";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, EXPIRES_IN } from "../config/env.config";

export const signUp = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

    const findUser = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (findUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    console.log(JWT_SECRET)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        },
    });


    // const token = jwt.sign({userId: user.id}, JWT_SECRET || "",  {expiresIn: (EXPIRES_IN || "2d") as any})
    const token = jwt.sign({userId: user.id}, JWT_SECRET as string,  {expiresIn: EXPIRES_IN as any})

    res.cookie("token", token, {
        httpOnly: true, // Prevents JavaScript access (Security)
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    return res.status(201).json({
        success: true,
        message: "User created successfully.",
        data: {
            user: user,
        },
    })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Server error";
        return res.status(500).json({message: "Server error", error: errorMessage});
    }

    
};

export const logIn = async (req: Request, res: Response) => {
    try {
        const {email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }   

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message : "Enter valid password" })
        }

        const token = jwt.sign({userId: user.id}, JWT_SECRET as string,  {expiresIn: EXPIRES_IN as any});

        res.cookie("token", token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

    return res.status(200).json({
        success: true,
        message: "User signed In successfully.",
        data: {
            user: user,
        }
    })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Server error";
        return res.status(500).json({message: "Server error", error: errorMessage});
    }

};

export const logOut = async (req: Request, res: Response) => {
    try {

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        });
        
        return res.status(200).json({
            success: true,
            message: "User logged out successfully.",
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
} 

