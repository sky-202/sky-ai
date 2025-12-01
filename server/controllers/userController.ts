import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response) => {
    //Incomplete
    const findUser = await prisma.user.findFirst({});

    if (findUser) {
        return res.json({ status: 400, message: "Email already exists" });
    }

    // const user = await prisma.user.create();
};
