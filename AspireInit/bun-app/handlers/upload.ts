//import { serve } from "bun";
//import { GoogleGenAI } from '@google/genai';
import { readdir } from "node:fs/promises";
import { Glob } from "bun";
const UPLOAD_DIR = "./upload_files";
const THUMB_DIR = "./thumbnails";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

async function handleUpload(req: Request): Promise<Response>
{
    try {

        const formData = await req.formData();
        const file = formData.get("image") as File | null;

        //console.log(`upload`);

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
        const filename = `${Date.now()}.${fileext || "image"}`;

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
        const placeholderHTML = `<img src="data:image/png;base64,${placeholder}" alt="Inlined Image" />`;

        return new Response('<h1>Images</h1>' + thumbimageHTML + '<br/>' + placeholderHTML, {
            headers: { "Content-Type": "text/html" },
        });

    }
    catch (error)
    {
        console.error("Error handling upload:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
      
}