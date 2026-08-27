import pluginVue from "eslint-plugin-vue";
import vuePrettier from "@vue/eslint-config-prettier";
import vueParser from "vue-eslint-parser";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["**/*.{js,ts,vue}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        importmeta: "readonly",
      },
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { sourceType: "module" },
    },
  },
  ...pluginVue.configs["flat/recommended"],
  vuePrettier,
  {
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-setup-props-destructure": "off",
      "vue/require-default-prop": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    ignores: ["dist", "node_modules", "drizzle", "*.config.js", "components.json"],
  },
];
