import prisma from "../config/prisma";
import { Role } from "@prisma/client";
import type { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { GeminiApiKey } from "../config/env.config";

declare global {
    namespace Express {
        interface Request {
            chatId?: number;
        }
    }
}

export const createMessage = async (req: Request, res: Response) => {
    try {
        const { message: prompt } = req.body;
        const chatId = req.chatId;

        if (!chatId) {
            return res
                .status(400)
                .json({ message: "Chat ID is not there in the req object" });
        }

        if (!GeminiApiKey) {
            return res.status(500).json({ message: "API key is not defined" });
        }

        const oldMessages = await prisma.message.findMany({
            where: { chatId: chatId },
            orderBy: { createdAt: "asc" },
        });

        const history = oldMessages.map((msg) => ({
            role: msg.role === "USER" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        const SkyAi = new GoogleGenAI({ apiKey: GeminiApiKey as string });

        const chat = SkyAi.chats.create({
            model: "gemini-2.5-flash",
            config: {
                thinkingConfig: {
                    thinkingBudget: 0,
                },
                systemInstruction:
                    "You are a very fast ai assistant who give quick and precise information.",
            },
            history: history,
        });

        const response = await chat.sendMessage(prompt);
        const responseTxt = response.text;

        if (!responseTxt) {
            return res.status(500).json({ message: "Empty response from AI" });
        }

        const messages = await prisma.message.createMany({
            data: [
                {
                    chatId: chatId,
                    content: prompt,
                },
                {
                    chatId: chatId,
                    role: "ASSISTANT",
                    content: responseTxt,
                },
            ],
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Server error";
        return res
            .status(500)
            .json({ message: "Server error", error: errorMessage });
    }
};

export const getMessage = async (req: Request, res: Response) => {
    // code karenge
};

// if (!response) {
//     return res.status(500).json({ message: "Unable to recive response from the Ai-model." })
// }

// const responseTxt = response.text || "";

// const messages = await prisma.message.createMany({
//     data: [
//         {
//             chatId: chatId,
//             content: prompt,
//         },
//         {
//             chatId: chatId,
//             role: "ASSISTANT",
//             content: responseTxt,
//         },
//     ]
// })

// return res.status(201).json({
//     success: true,
//     data: {messages},

// })
