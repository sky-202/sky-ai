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
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const chats = await prisma.chat.findMany({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'desc', // newest first
            },
            include: {
                // Optional: Include the first message to show a preview
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if(!chats) {
            return res.status(404).json({ message: "No chats found for the user" });
        }

        return res.status(200).json({
            success: true,
            data: chats,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Chat controller error";
        return res.status(500).json({ message: "Chat controller error", error: errorMessage });
    }
}

export const deleteChatById = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Chat ID is required" });
        }

        const chatId = parseInt(id, 10);

        if (isNaN(chatId)) {
            return res.status(400).json({ message: "Invalid Chat ID" });
        }

        const existingChat = await prisma.chat.findUnique({
            where: { id: chatId },
        });

        if (!existingChat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (existingChat.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized to delete this chat" });
        }

        await prisma.chat.delete({
            where: { id: chatId },
        });

        return res.status(200).json({
            success: true,
            message: "Chat deleted successfully",
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Server error";
        return res.status(500).json({ message: "Server error", error: errorMessage });
    }
};

export const updateChatById = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { title } = req.body; // New title from body

        if (!id) {
            return res.status(400).json({ message: "Chat ID is required" });
        }

        const chatId = parseInt(id, 10);

        if (isNaN(chatId)) {
            return res.status(400).json({ message: "Invalid Chat ID" });
        }

        if (!title || title.trim() === "") {
            return res.status(400).json({ message: "Title is required" });
        }

        // Check existence and ownership
        const existingChat = await prisma.chat.findUnique({
            where: { id: chatId },
        });

        if (!existingChat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        if (existingChat.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this chat" });
        }

        // Perform the update
        const updatedChat = await prisma.chat.update({
            where: { id: chatId },
            data: {
                title: title.trim(),
            },
        });

        return res.status(200).json({
            success: true,
            data: updatedChat,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Server error";
        return res.status(500).json({ message: "Server error", error: errorMessage });
    }
}
