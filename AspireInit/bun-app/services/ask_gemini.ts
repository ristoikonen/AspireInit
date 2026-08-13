import { GoogleGenAI } from '@google/genai';
import { readdir } from "node:fs/promises";
import { Glob } from "bun";
const UPLOAD_DIR = "./upload_files";
const THUMB_DIR = "./thumbnails";


export default async function askGemini(ai: GoogleGenAI, promptText: string): Promise<string> {
    try {
        console.log("Gemini prompt: " + promptText);

        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents: promptText,
        });

        console.log(response.text);

        return response.text || "";

    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        return "";
    }
}


export async function askGeminiImageQuestion(ai: GoogleGenAI, promptText: string, imageFile: Bun.Image): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            // "Analyze this image and describe what you see in detail."
            contents: [
                { text: promptText},
                {
                    inlineData: {
                        data: await imageFile.toBase64(),
                        //mimeType: (await imageFile.metadata())
                        //metadata: await imageFile.metadata(),
                    },
                },
            ],
        });
        return response.text || "";
    } catch (error) {
        console.error("Error communicating with Gemini:", error);
        return ""; 
    }
}

// TODO: fix just png
export async function analyseGeminiBase64(ai: GoogleGenAI, promptText: string, imageFile: Bun.Image): Promise<string> {

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: [
            promptText,
            {
                inlineData: {
                    mimeType: 'image/png',
                    data: await imageFile.toBase64() || "",
                }
            }
        ]
    })
    return response.text || "";

}