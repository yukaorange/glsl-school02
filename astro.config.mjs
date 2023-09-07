import { defineConfig } from "astro/config";
import { glslify } from 'vite-plugin-glslify';

// https://astro.build/config
export default defineConfig({
  vite: {
    // css: {
    //   preprocessorOptions: {
    //     scss: {
    //       additionalData: `@import "src/styles/style.scss";`,
    //     },
    //   },
    // },
    plugins: [glslify()],
    build: {
      rollupOptions: {
        output: {
          entryFileNames: "js/index.js",
        },
      },
      // minify: false,
      minify: true,
    },
  },
  base: "",
});
