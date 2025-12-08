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
        console.log("Incoming Body:", req.body);
        const id = req.params.id;

        if (!prompt) {
            return res.status(400).json({ message: "Message content is required" });
        }
        if (!id) {
            return res.status(400).json({ message: "Chat ID not provided in the params." });
        }

        const chatId = parseInt(id, 10);

        if (!chatId) {
            return res
                .status(400)
                .json({ message: "Chat ID not provided in the params." });
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

        const response = await chat.sendMessage({
            message: prompt
        });
        const responseTxt = response.text;

        if (!responseTxt) {
            return res.status(500).json({ message: "Empty response from AI" });
        }

        await prisma.message.createMany({
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

        console.log("14")
        return res.status(201).json({
            success: true,
            data: {
                userMessage: prompt,
                aiMessage: responseTxt
            }
        });
        console.log("15")

    } catch (error) {
        console.log("16")
        const errorMessage =
            error instanceof Error ? error.message : "Server error";
        return res
            .status(500)
            .json({ message: "Server error", error: errorMessage });
    }
};

export const getMessagesByChatId = async (req: Request, res: Response) => {
    // gets all the messages of the ChatId
};

export const updateMsg = async (req: Request, res: Response) => {
    // update the poromt
};

export const deleteMessage = async (req: Request, res: Response) => {
    // can delete prompt or response
};


