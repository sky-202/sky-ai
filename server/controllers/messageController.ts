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

        return res.status(201).json({
            success: true,
            data: {
                userMessage: prompt,
                aiMessage: responseTxt
            }
        });

    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Server error";
        return res
            .status(500)
            .json({ message: "Server error", error: errorMessage });
    }
};

export const getMessagesByChatId = async (req: Request, res: Response) => {
    try {
        const id = req.params.id; 
        const userId = req.userId;

        if (!id) return res.status(400).json({ message: "Chat ID missing" });

        const chatId = parseInt(id, 10);
        if (isNaN(chatId)) return res.status(400).json({ message: "Invalid Chat ID" });

        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
            select: { userId: true } // Select only what we need
        });

        if (!chat) return res.status(404).json({ message: "Chat not found" });
        
        if (chat.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized access to this chat" });
        }

        // 2. Fetch Messages
        const messages = await prisma.message.findMany({
            where: { chatId: chatId },
            orderBy: { createdAt: "asc" }, // Oldest first (chronological order)
        });

        return res.status(200).json({
            success: true,
            data: messages,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Server error";
        return res.status(500).json({ message: "Server error", error: errorMessage });
    }
};

export const updateMsg = async (req: Request, res: Response) => {
    try {
        const id = req.params.id; 
        const { message: newContent } = req.body;
        const userId = req.userId;

        if (!id) return res.status(400).json({ message: "Message ID missing" });
        if (!newContent) return res.status(400).json({ message: "New content is required" });

        const messageId = parseInt(id, 10);
        if (isNaN(messageId)) return res.status(400).json({ message: "Invalid Message ID" });

        // 1. Find the message and include Chat to check User ID
        const existingMessage = await prisma.message.findUnique({
            where: { id: messageId },
            include: { chat: true } // Need this to check userId
        });

        if (!existingMessage) {
            return res.status(404).json({ message: "Message not found" });
        }

        // 2. Ownership Check
        if (existingMessage.chat.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized to update this message" });
        }

        // 3. Role Check: Prevent editing AI responses (Optional but recommended)
        if (existingMessage.role !== "USER") {
            return res.status(400).json({ message: "You can only edit your own prompts, not AI responses." });
        }

        // 4. Update
        const updatedMessage = await prisma.message.update({
            where: { id: messageId },
            data: { content: newContent },
        });

        return res.status(200).json({
            success: true,
            data: updatedMessage,
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Server error";
        return res.status(500).json({ message: "Server error", error: errorMessage });
    }
};

export const deleteMessage = async (req: Request, res: Response) => {
    try {
        const id = req.params.id; // Message ID
        const userId = req.userId;

        if (!id) return res.status(400).json({ message: "Message ID missing" });

        const messageId = parseInt(id, 10);
        if (isNaN(messageId)) return res.status(400).json({ message: "Invalid Message ID" });

        // 1. Find Message to verify ownership
        const existingMessage = await prisma.message.findUnique({
            where: { id: messageId },
            include: { chat: true }
        });

        if (!existingMessage) {
            return res.status(404).json({ message: "Message not found" });
        }

        // 2. Ownership Check
        if (existingMessage.chat.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized to delete this message" });
        }

        // 3. Delete
        await prisma.message.delete({
            where: { id: messageId },
        });

        return res.status(200).json({
            success: true,
            message: "Message deleted successfully",
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Server error";
        return res.status(500).json({ message: "Server error", error: errorMessage });
    }
};


