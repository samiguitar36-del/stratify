import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
var currentFilePath = fileURLToPath(import.meta.url);
var currentDir = dirname(currentFilePath);
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            input: {
                landing: resolve(currentDir, "index.html"),
                app: resolve(currentDir, "app/index.html"),
            },
        },
    },
});
