const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "styles.css");
const destDir = path.join(__dirname, "..", "dist");
const dest = path.join(destDir, "styles.css");

if (fs.existsSync(src)) {
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("[postbuild] Copied styles.css to dist/");
} else {
  console.warn("[postbuild] styles.css not found, nothing copied.");
}

