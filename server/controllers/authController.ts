// import prisma from '../config/db.config.js'
import prisma from "../config/prisma";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
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
        return res.json({ status: 400, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        },
    });

    const token = jwt.sign({userId: user.id}, JWT_SECRET || "",  {expiresIn: (EXPIRES_IN || "2d") as any})

    return res.status(201).json({
        token: token,
        data: user, 
        message: "User created successfully.",
        satus: 201,
    })
    } catch (error) {
        console.log(error);
    }

    
    
};

export const signIn = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const findUser = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (findUser) {
        return res.json({ status: 400, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        },
    });

    // const token = jwt.sign({userId: user.id}, JWT_SECRET,  EXPIRES_IN)

    return res.status(201).json({
        data: user, 
        message: "User created successfully.",
        satus: 201,
    })
};



// console.log("yehh le...") 

