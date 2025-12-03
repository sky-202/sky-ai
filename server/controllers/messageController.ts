import prisma from "../config/prisma";
import { Role } from "@prisma/client";
import type { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { GeminiApiKey } from "../config/env.config";

export const createMessage = async (req: Request, res: Response) => {
    const { message: prompt, chatId } =  req.body;

    if (!GeminiApiKey) {
        return res.status(500).json({ message: "API key is not defined" })    
    }
    const SkyAi = new GoogleGenAI({ apiKey: GeminiApiKey as string});

    const response = await SkyAi.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    });
    
    if (!response) {
        return res.status(500).json({ message: "Unable to recive response from the Ai-model." })   
    }

    const responseTxt = response.text || ""; 

    const msgs = await prisma.message.createMany({
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
        ]
    })

    return res.status(201).json({
        success: true,
        data: {msgs},
    })
    
    // send the prompt to gemini api
        // have to learn "how to handle Gemini api response"
    // get the response in response
    // store both the prompt and response in message
        // store it in a way that prompt is stored as "isBot: false" and response is stored as "isBot: true"
    // send the response in json
}

export const getMessage = async (req: Request, res: Response) => {
    
}

// import { GoogleGenAI } from "@google/genai";

// const SkyAi = new GoogleGenAI({ apiKey: "AIzaSyC-0pXRg" });

// async function main() {
//   const response = await SkyAi.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: "describe about Shree Ram, Shree Krishna and param pujya Shree Premanandji Maharaj.",
//   });
//   console.log(response.text);
// }

// main();
























































/*
sita ram 
sita ram 
sita ram 
sita ram
sita ram
sita ram
sita ram 
sita ram
sita ram
sita ram 
sita ram
sita ram 
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram 
sita ram 
sita ram
sita ram 
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram 
sita ram
sita ram
sita ram 
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram 
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram 
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram 
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
sita ram
*/