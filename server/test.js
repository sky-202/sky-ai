import { GoogleGenAI } from "@google/genai";
import { GeminiApiKey } from "./config/env.config.ts";


const SkyAi = new GoogleGenAI({ apiKey: GeminiApiKey});

async function main() {
  const response = await SkyAi.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Who is narendra modi.",
    config: {
            thinkingConfig: {
                thinkingBudget: 0,
            },
            systemInstruction: "You are a very fast ai assistant who give quick and precise information."
        }
  });
  console.log("reponse.text: ",response.text);
  console.log("response:",response);
  console.log("title: ", response.title)
}

main();


async function main1() {
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [
      {
        role: "user",
        parts: [{ text: "Hello" }],
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }],
      },
    ],
  });

  const response1 = await chat.sendMessage({
    message: "I have 2 dogs in my house.",
  });
  console.log("Chat response 1:", response1.text);

  const response2 = await chat.sendMessage({
    message: "How many paws are in my house?",
  });
  console.log("Chat response 2:", response2.text);
}

// await main();
