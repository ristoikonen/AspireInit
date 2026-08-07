//import { serve } from "bun";
import { readdir } from "node:fs/promises";
import { Glob } from "bun";

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

    const color1 = Bun.color([255, 99, 71, 255])

    const image1 = new Bun.Image(Bun.file("rect1.png"));
    const base64String = await image1.toBase64();

    console.log("Base64 String:", base64String);

    //const image2 = new Bun.Image(Bun.file("rect2.png"));
    // const lqip = await Bun.file("hero.jpg").image().placeholder();
    //const { width, height, format } = await new Bun.Image(imageFile).metadata();

    const imageFile = Bun.file("rect1.png");

    const bunimages: Array<Bun.Image> =[];

    let images = "";
    const imageHTML = `<img src="data:image/png;base64,${base64String}" alt="Inlined Image" />`;

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
            //"<img src={lqip} />"

            //const constb64 = await image?.toBase64();
            //const ims = await image.toBase64();
            //console.log(ims);
        }
        //const images64 = bunimages.map((image) => `<img src="data:image/png;base64,${image.toBase64()}" />`).join("\n");
    }

    //const constb64 = await bunimages[0]?.toBase64();
    const body = greetingText + countimages.toString() + " images found in the images folder." + imageHTML + images;


    //const { width, height, format } = await new Bun.Image(input).metadata();
    // => { width: 1920, height: 1080, format: "jpeg" }

    const blob1 = imageFile;

    //await res2.blob();

    const server = Bun.serve({
        port,
        fetch(_req) {
            //return new Response(new Blob([blob1]));

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

