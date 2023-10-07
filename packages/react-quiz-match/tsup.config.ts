import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  minify: true,
  sourcemap: true,
  clean: false,
  format: ["esm", "cjs"],
  noExternal: ["react-aria"],
  external: ["react"],
});
