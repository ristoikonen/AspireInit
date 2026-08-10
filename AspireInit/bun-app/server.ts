//import { serve } from "bun";
import { GoogleGenAI } from '@google/genai';
import { readdir } from "node:fs/promises";
import { Glob } from "bun";
const UPLOAD_DIR = "./upload";
const THUMB_DIR = "./thumbnails";

// https://maps.googleapis.com/maps/api/geocode/json?address=London&key=AIzaSyYOUR_KEY_HERE

const GOOGLE_API_KEY = "AQ.Ab8RN6LSdaCauRXLdp7SgcQb1wCwrCzbKulj-FiwtYEpOtIVmQ";

//    "AIzaSyBaSgblDBCZLRTTAr-7wiQ9zAFoz0wnW6E"; // "AIzaSyAk3oN-1Enge_LXitnHL4XFZDWSNMrCKwM";

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
    const image1 = new Bun.Image(Bun.file("rect1.png"));
    const base64String = await image1.toBase64();
    // console.log("Base64 String:", base64String);

    let images = "";
    const imageHTML = `<img src="data:image/png;base64,${base64String}" alt="Inlined Image" />`;



    //-- Google API------------

    // It is best practice to load the key from environment variables (e.g., process.env.GEMINI_API_KEY)
    const apiKey = GOOGLE_API_KEY;  // + 'M'; //process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY environment variable.");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    async function askGemini(promptText: string): Promise<void> {
        try {
            // Call the Gemini 2.5 Flash model
            const response = await ai.models.generateContent({
                model: 'gemini-3.6-flash',
                contents: promptText,
            });

            console.log("Gemini Response:");
            console.log(response.text);
        } catch (error) {
            console.error("Error communicating with Gemini:", error);
        }
    }


    async function askGeminiQ(promptText: string, imageFile: Bun.Image): Promise<string>
    {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                // provide each content part as its own element in the contents array
                contents: [
                    { text: "Analyze this image and describe what you see in detail." },
                    {
                        inlineData: {
                            data: await imageFile.toBase64(),
                            //mimeType: (await imageFile.metadata())
                            //metadata: await imageFile.metadata(),
                        },
                    },
                ],
            });

            console.log("Gemini Response:");
            return response.text || "";
        } catch (error) {
            console.error("Error communicating with Gemini:", error);
            return ""; // <- ensure a string is returned on all paths
        }
    }


    async function analGeminiBse64(promptText: string, imageFile: Bun.Image): Promise<string> {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
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
        const ima = new Bun.Image(Bun.file(file));
        bunimages.push(ima);
        //const lqip = await Bun.file("hero.jpg").image().placeholder();
        //const constb64 = await ima?.toBase64();
        //images += `<img src=${lqip} />`;
        //images += `<img src="data:image/png;base64,${constb64}" alt="${file}" />`;
    }

    const countimages = bunimages.length;

    // Precompute base64 strings so we don't need await inside the HTMLRewriter handler
    //const imageBase64s: string[] = await Promise.all(bunimages.map((img) => img.toBase64()));

    const rewriter = new HTMLRewriter().on("img", {
        element(img) {


            
        },
    });


    // alt="${image.dataurl}"

    if (bunimages.length > 0) {

        for (const image of bunimages) {

            //const du = image.webp;
            //images += du;
            const lqip = await image.placeholder();
            images += `<img src="${lqip}" />`;
            
            //const constb64 = await image?.toBase64();
            //const ims = await image.toBase64();
            //console.log(ims);
        }
        //const images64 = bunimages.map((image) => `<img src="data:image/png;base64,${image.toBase64()}" />`).join("\n");
    }

    //const constb64 = await bunimages[0]?.toBase64();
    const body = greetingText + countimages.toString() + " images found in the images folder."
        + imageHTML + images;

    const server = Bun.serve({
        port,
        async fetch(req) {

            const url = new URL(req.url);
            console.log(`Request URL:${url.toString()}`);

            await askGemini("Explain the difference between a REST API and GraphQL in two sentences.");

            // POST
            if (req.method === "POST" && url.pathname === "/upload") {
                const formData = await req.formData();
                const file = formData.get("image") as File | null;
                //const returnJson = formData.get("jsonformat") === "yes";

                // + returnJson
                console.log(`upload`);

                // Validate image file
                if (!file) {
                    return new Response("Invalid image", { status: 400 });
                }

                const buffer = Buffer.from(await file!.arrayBuffer());
                const image = new Bun.Image(buffer);
                const meta = await image.metadata();

                // Validate image metadata
                if (!meta.width || !meta.height) {
                    return new Response("Invalid image", { status: 400 });
                }

                const fileext =
                    meta.format === "jpeg" ? "jpg" :
                    meta.format === "png" ? "png" :
                    meta.format === "gif" ? "gif" :
                    meta.format === "bmp" ? "bmp" : 
                    null;

                // Generate filename
                //const ext = meta.format === "jpeg" ? "jpg" : meta.format;
                const filename = `${Date.now()}.${fileext}`;

                // Save original
                await Bun.file(`${UPLOAD_DIR}/${filename}`).write(buffer);

                // Generate thumbnail (400px wide, maintaining aspect ratio)
                await image
                    .resize(400)
                    .jpeg({ quality: 80 })
                    .write(`${THUMB_DIR}/${filename}`);

                // Generate placeholder for blur-up
                const placeholder = await image.placeholder();
                const base64 = await image.toBase64();

                //TODO: add dynamic data string!
                const thumbimageHTML = `<img src="data:image/png;base64,${base64}" alt="Inlined Image" />`;

                if (formData.get("jsonformat") === "yes") {
                    return Response.json({
                        filename,
                        width: meta.width,
                        height: meta.height,
                        format: meta.format,
                        placeholder,
                        urls: {
                            original: `/images/${filename}`,
                            thumbnail: `/thumbs/${filename}`,
                        },
                    });
                }

                return new Response('<h1>Hello, World! </h1>' + thumbimageHTML, {
                    headers: { "Content-Type": "text/html" },
                });
            }

            // NOT POST and /upload, serve the HTML page
            return new Response(body, {
                headers: { "Content-Type": "text/html" },
            });

        },
    });

    console.log(`Bun server listening on http://${server.hostname}:${server.port}`);
})().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});

