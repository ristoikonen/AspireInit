//import { serve } from "bun";
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { readdir } from "node:fs/promises";
import { Glob } from "bun";

import handleUpload from './handlers/upload';
import askGemini, { analyseGeminiBase64 } from './services/ask_gemini';
const UPLOAD_DIR = "./upload_files";
const THUMB_DIR = "./thumbnails";



(async function main() {
    const port = Number(process.env.PORT ?? 3000);
    const files = await readdir("./images");

    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
        throw new Error("Missing GOOGLE_API_KEY environment variable.");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const imagesfilenames: Array<string> = [];

    const glob = new Glob("*");
    for (const file of glob.scanSync("./images")) {
        console.log(file);
        console.log('glob');
        imagesfilenames.push("./images/" + file);
    }
    
    //const color1 = Bun.color([255, 99, 71, 255])
    //const { width, height, format } = await new Bun.Image(imageFile).metadata();

    const bunimages: Array<Bun.Image> = [];
    const fileArrayData = Bun.file("rect1.png");
    const image1 = new Bun.Image(await fileArrayData.arrayBuffer());
    const base64String = await image1.toBase64();

    const yn_answer =  await analyseGeminiBase64(ai, "Is this image a rectagle? Answer with just one word: Yes/No..", image1);
    console.log("Gemini answer server.ts:" + yn_answer);

    let images = "";
    const imageHTML = `<img src="data:image/png;base64,${base64String}" alt="Inlined Image" />`;

    // Avoid putting GoogleGenAI initialization 
    // or direct API calls directly inside your route handlers.
    // If you change frameworks later(e.g., moving from Bun's native server 
    // to Hono or Express), keeping services isolated means you won't have to rewrite your Gemini logic.



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

    if (bunimages.length > 0) {

        for (const image of bunimages) {

            //const du = image.webp;
            //images += du;
            const lqip = await image.placeholder();
            images += `<img src="${lqip}" />`;
        }
    }

    const body = countimages.toString() + " images found in the images folder."
        + imageHTML + images;

    const server = Bun.serve({
        port,
        async fetch(req) {
                        
            const url = new URL(req.url);
            //console.log(`Request URL:${url.toString()}`);


            //Analyse Bun.Image with Gemini
            //const fileArrayData2 = Bun.file("rect2.png");
            //const image2 = new Bun.Image(await fileArrayData2.arrayBuffer());

            switch (req.method) {
                case 'POST':
                    switch (url.pathname) {

                        case '/uploadnew':
                            return await handleUpload(req);
                    }
                case 'GET':
                    switch (url.pathname) {

                        case '/':

                            await askGemini(ai, "Explain what is in this HTML page:" + body);

                            return new Response(body, {
                                headers: { "Content-Type": "text/html" },
                            });
                    }
                default:
                    return new Response('Not Found', {
                        status: 404
                    })
            }
        },
    });

    console.log(`Bun server listening on http://${server.hostname}:${server.port}`);
})().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});

