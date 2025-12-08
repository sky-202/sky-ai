import prisma from "../config/prisma";
import type { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { GeminiApiKey } from "../config/env.config";

export const createChat = async (req: Request, res: Response) => {
    try {
        const { message: prompt } = req.body;
        const userId = req.userId;

        if (!GeminiApiKey) {
            return res.status(500).json({ message: "API key is not defined" });
        }

        const SkyAi = new GoogleGenAI({ apiKey: GeminiApiKey });

        const response = await SkyAi.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        if (!response) {
            return res.status(500).json({
                message: "Unable to recive response from the Ai-model.",
            });
        }

        const responseTxt = response.text || "";

        const newChat = await prisma.chat.create({
            data: {
                userId: userId,
                title: responseTxt.substring(0, 30) + "...",
                messages: {
                    create: [
                        {
                            role: "USER",
                            content: prompt,
                        },
                        {
                            role: "ASSISTANT",
                            content: responseTxt,
                        },
                    ],
                },
            },
        });

        req.chatId = newChat.id;

        return res.status(201).json({
            success: true,
            data: newChat,
        });

    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Server error";
        return res
            .status(500)
            .json({ message: "Server error", error: errorMessage });
    }
};

export const getChatsByUserId = async (req: Request, res: Response) => {

}

export const deleteChatById = async (req: Request, res: Response) => {

}

export const updateChatById = async (req: Request, res: Response) => {
    // Edit the title of the chat
}


