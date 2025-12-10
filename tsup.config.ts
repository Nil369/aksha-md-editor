import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts"],
    dts: true,
    sourcemap: true,
    clean: true,
    minify: true,
    format: ["esm", "cjs"],
    external: ["react", "react-dom", "@monaco-editor/react"],
    esbuildOptions(options) {
        options.banner = {
            js: '"use client";',
        };
    },
});

