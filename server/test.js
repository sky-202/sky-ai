import { GoogleGenAI } from "@google/genai";

const SkyAi = new GoogleGenAI({ apiKey: "AIzaSyC-mr2OgrKhH4oC04TSaoMFDwPS7h0pXRg" });

async function main() {
  const response = await SkyAi.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "describe about Shree Ram, Shree Krishna and param pujya Shree Premanandji Maharaj.",
  });
  console.log(response.text);
}

main();