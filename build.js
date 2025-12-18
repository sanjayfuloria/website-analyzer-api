import esbuild from "esbuild";

const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: ["server.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: "build/server.js",
  format: "esm",
  sourcemap: true,
  external: [
    "cheerio",
    "node-fetch",
    "express",
    "cors",
    "playwright",
    "playwright-core",
  ],
};

if (isWatch) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(buildOptions);
  console.log("Build complete!");
}
