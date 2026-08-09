// Aspire TypeScript AppHost
// For more information, see: https://aspire.dev

import { createBuilder } from "./.aspire/modules/aspire.mjs";

(async () => {
  const builder = await createBuilder();

    const bunApi = await builder.addBunApp("bun-api", "../bun-app", "server.ts");

    const bunApp2 = await builder.addBunApp("bunupload", "../bun-upload", "upload.ts")
        .withHttpEndpoint({ port: 3000, env: "PORT" })
        .withReference(bunApi); // Optional: connect it to your first app

  await bunApi.withHttpEndpoint({ port: 3000, env: "PORT" });

  await builder.build().run();
})();

// import { createBuilder } from './.aspire/modules/aspire.mjs';

// const builder = await createBuilder();

// await builder.build().run();