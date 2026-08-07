var builder = DistributedApplication.CreateBuilder(args);

var apiService = builder.AddProject<Projects.AspirInit_ApiService>("apiservice")
    .WithHttpHealthCheck("/health");

//var bunApp = builder.AddBunApp("bun-api", "../bun-app", "server.ts")
//    .WithHttpEndpoint(port: 3000, env: "PORT")
//    .WithReference(apiService)
//    .WaitFor(apiService);

var bunApp = builder.AddBunApp("bunapp", "../bun-app", "server.ts").WithHttpEndpoint(port: 3000, env: "PORT");
//.addBunApp("bunapp", "./bun-app", "server.ts")
//.withExternalHttpEndpoints();


builder.AddProject<Projects.AspirInit_Web>("webfrontend")
    .WithExternalHttpEndpoints()
    .WithHttpHealthCheck("/health")
    .WithReference(apiService)
    .WaitFor(apiService);

builder.Build().Run();
