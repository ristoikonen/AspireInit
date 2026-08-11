// import { GoogleGenAI } from '@google/genai';
// import { readdir } from "node:fs/promises";
// import { Glob } from "bun";
// const UPLOAD_DIR = "./upload_files";
// const THUMB_DIR = "./thumbnails";
// //NOTE: Key is missing letters!
// //const GOOGLE_API_KEY = "AQ.Ab8RN6LSdaCauRXLdp7SgcQb1wCwrCzbKulj-FiwtYEpOtIVm";
// const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// // It is best practice to load the key from environment variables (e.g., process.env.GEMINI_API_KEY)
// const apiKey = GOOGLE_API_KEY;  //process.env.GEMINI_API_KEY;

// if (!apiKey) {
//     throw new Error("Missing GEMINI_API_KEY environment variable.");
// }

// const ai = new GoogleGenAI({ apiKey: apiKey });

// async function askGemini(promptText: string): Promise<void> {
//     try {

//         const response = await ai.models.generateContent({
//             model: 'gemini-3.6-flash',
//             contents: promptText,
//         });

//         console.log("Gemini Response:");
//         console.log(response.text);

//         return response.text || "";

//     } catch (error) {
//         console.error("Error communicating with Gemini:", error);
//     }
// }


// async function askGeminiQ(promptText: string, imageFile: Bun.Image): Promise<string> {
//     try {
//         const response = await ai.models.generateContent({
//             model: 'gemini-2.5-flash',
//             // provide each content part as its own element in the contents array
//             contents: [
//                 { text: "Analyze this image and describe what you see in detail." },
//                 {
//                     inlineData: {
//                         data: await imageFile.toBase64(),
//                         //mimeType: (await imageFile.metadata())
//                         //metadata: await imageFile.metadata(),
//                     },
//                 },
//             ],
//         });

//         console.log("Gemini Response:");
//         return response.text || "";
//     } catch (error) {
//         console.error("Error communicating with Gemini:", error);
//         return ""; 
//     }
// }


// async function analGeminiBse64(promptText: string, imageFile: Bun.Image): Promise<string> {
//     const response = await ai.models.generateContent({
//         model: 'gemini-2.5-flash',
//         contents: [
//             'Describe this image in twenty or so words:',
//             {
//                 inlineData: {
//                     // Replace with your file's actual MIME type (e.g., application/pdf)
//                     mimeType: 'image/jpeg',
//                     data: await imageFile.toBase64() || "",
//                 }
//             }
//         ]
//     })
//     return response.text || "";

// }