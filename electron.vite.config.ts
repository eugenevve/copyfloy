import { resolve } from "path";

import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@main": resolve("src/main"),
        "@shared": resolve("src/shared"),
        "@resources": resolve("resources"),
        "@package": resolve("package.json"),
      },
    },
  },
  preload: {
    resolve: {
      alias: {
        "@shared": resolve("src/shared"),
        "@package": resolve("package.json"),
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@app": resolve("src/renderer/src"),
        "@shared": resolve("src/shared"),
      },
    },
  },
});
