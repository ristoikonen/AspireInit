//import { serve } from "bun";
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { readdir } from "node:fs/promises";
import { Glob } from "bun";

import handleUpload from './handlers/upload';
const UPLOAD_DIR = "./upload_files";
const THUMB_DIR = "./thumbnails";



(async function main() {
    const port = Number(process.env.PORT ?? 3000);
    const files = await readdir("./images");

    const imagesfilenames: Array<string> = [];

    const glob = new Glob("*");
    for (const file of glob.scanSync("./images")) {
        console.log(file);
        console.log('glob');
        imagesfilenames.push("./images/" + file);
    }

    const isScriptRun = process.env.npm_lifecycle_event !== undefined;
    const greetingText = isScriptRun ? "<h1>Hello from bun script!</h1>" : "<h1>Hello from bun!</h1>";

    //const color1 = Bun.color([255, 99, 71, 255])
    //const { width, height, format } = await new Bun.Image(imageFile).metadata();

    const bunimages: Array<Bun.Image> = [];
    const fileArrayData = Bun.file("rect1.png");
    const image1 = new Bun.Image(await fileArrayData.arrayBuffer());
    const base64String = await image1.toBase64();

    let images = "";
    const imageHTML = `<img src="data:image/png;base64,${base64String}" alt="Inlined Image" />`;

    // Avoid putting GoogleGenAI initialization 
    // or direct API calls directly inside your route handlers.
    // If you change frameworks later(e.g., moving from Bun's native server 
    // to Hono or Express), keeping services isolated means you won't have to rewrite your Gemini logic.

    const apiKey = Bun.env.GOOGLE_API_KEY;

    if (!apiKey) {
        throw new Error("Missing GOOGLE_API_KEY environment variable.");
    }
    else{
        console.log(apiKey);
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    

    async function askGemini(promptText: string): Promise<void> {
        try {

            console.log(`askGemini`);

            const response = await ai.models.generateContent({
                model: 'gemini-3.1-flash-lite',
                contents: promptText,
            });

            console.log("Gemini Response:");
            console.log(response.text);
        } catch (error) {
            console.error("Error communicating with Gemini:", error);
        }
    }


    async function getGeminiResponse(promptText: string): Promise<GenerateContentResponse> {
        try {
            return await ai.models.generateContent({
                model: 'gemini-3.1-flash-lite',
                contents: promptText,
            });

            //console.log("Gemini Response:" + response.text);
            //return response;

        } catch (error) {
            console.error("Error communicating with Gemini:", error);
            return new GenerateContentResponse(); 
        }
    }


    async function askGeminiImageQuestion(promptText: string, imageFile: Bun.Image): Promise<string>
    {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3.1-flash-lite',
                // provide each content part as its own element in the contents array
                contents: [
                    { text: promptText },
                    {
                        inlineData: {
                            data: await imageFile.toBase64(),
                            mimeType: 'image/png', // Added required mimeType
                            //mimeType: (await imageFile.metadata())
                            //metadata: await imageFile.metadata(),
                        },
                    },
                ],
            });

            console.log("Gemini Response:" + (response.text || ""));
            return response.text || "";
        } catch (error) {
            console.error("Error communicating with Gemini:", error);
            return ""; 
        }
    }


    async function analGeminiBse64(promptText: string, imageFile: Bun.Image): Promise<string> {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: [
                'Describe this image in twenty or so words:',
                {
                    inlineData: {
                        // Replace with your file's actual MIME type (e.g., application/pdf)
                        mimeType: 'image/jpeg',
                        data: await imageFile.toBase64() || "",
                    }
                }
            ]
        })
        return response.text || "";

    }

    //---EO Google API----------


    for (const file of imagesfilenames) {

        const fileData = Bun.file(file);

        const ima = new Bun.Image(await fileData.arrayBuffer());
        bunimages.push(ima);
        //const lqip = await Bun.file("hero.jpg").image().placeholder();
        //const constb64 = await ima?.toBase64();
        //images += `<img src=${lqip} />`;
        //images += `<img src="data:image/png;base64,${constb64}" alt="${file}" />`;
    }

    const countimages = bunimages.length;

//    const rewriter = new HTMLRewriter().on("img", {
//        element(img) {
//        },
//    });


    if (bunimages.length > 0) {

        for (const image of bunimages) {

            //const du = image.webp;
            //images += du;
            const lqip = await image.placeholder();
            images += `<img src="${lqip}" />`;
        }
    }

    const body = greetingText + countimages.toString() + " images found in the images folder."
        + imageHTML + images;

    const server = Bun.serve({
        port,
        async fetch(req) {
                        
            const url = new URL(req.url);
            console.log(`Request URL:${url.toString()}`);


            //Analyse Bun.Image with Gemini
            const fileArrayData2 = Bun.file("rect2.png");
            const image2 = new Bun.Image(await fileArrayData2.arrayBuffer());
           
            switch (req.method) {
                case 'POST':
                    switch (url.pathname) {

                        case '/uploadnew':
                            return await handleUpload(req);
                    }
                case 'GET':
                    switch (url.pathname) {

                        case '/':
                            await askGemini("Explain what is in this HTML page:" + body);
                            return new Response(body, {
                                headers: { "Content-Type": "text/html" },
                            });
                    }
                default:
                    return new Response('Not Found', {
                        status: 404
                    })
            }
            

            // if (req.method === "GET" && url.pathname === "/") {
            //     //Ask Gemini
                

            // }
            // // POST
            // if (req.method === "POST" && url.pathname === "/upload") {
            //     const formData = await req.formData();
            //     const file = formData.get("image") as File | null;
            //     //const returnJson = formData.get("jsonformat") === "yes";
            //     // Validate image file
            //     if (!file) {
            //         return new Response("Invalid image", { status: 400 });
            //     }

            //     const buffer = Buffer.from(await file!.arrayBuffer());
            //     const image = new Bun.Image(buffer);
            //     const meta = await image.metadata();

            //     // Validate image metadata
            //     if (!meta.width || !meta.height) {
            //         return new Response("Invalid image", { status: 400 });
            //     }

            //     const fileext =
            //         meta.format === "jpeg" ? "jpg" :
            //         meta.format === "png" ? "png" :
            //         meta.format === "gif" ? "gif" :
            //         meta.format === "bmp" ? "bmp" : 
            //         null;

            //     // Generate filename
            //     //const ext = meta.format === "jpeg" ? "jpg" : meta.format;
            //     const filename = `${Date.now()}.${fileext}`;

            //     // Save original
            //     await Bun.file(`${UPLOAD_DIR}/${filename}`).write(buffer);

            //     // Generate thumbnail (400px wide, maintaining aspect ratio)
            //     await image
            //         .resize(400)
            //         .jpeg({ quality: 80 })
            //         .write(`${THUMB_DIR}/${filename}`);

            //     // Generate placeholder for blur-up
            //     const placeholder = await image.placeholder();
            //     const base64 = await image.toBase64();

            //     //TODO: add dynamic data string!
            //     const thumbimageHTML = `<img src="data:image/png;base64,${base64}" alt="Inlined Image" />`;
                                
            //     await askGeminiImageQuestion("Explain the image.", image);

            //     return new Response('<h1>Hello, World! </h1>' + thumbimageHTML, {
            //         headers: { "Content-Type": "text/html" },
            //     });
            // }

            // // NOT POST and /upload, serve the HTML page
            // return new Response(body, {
            //     headers: { "Content-Type": "text/html" },
            // });

        },
    });

    console.log(`Bun server listening on http://${server.hostname}:${server.port}`);
})().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});

