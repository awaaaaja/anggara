import pluginVue from "eslint-plugin-vue";
import vuePrettier from "@vue/eslint-config-prettier";

export default [
  {
    files: ["**/*.{js,vue}"],
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
  ...pluginVue.configs["flat/recommended"],
  vuePrettier,
  {
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-setup-props-destructure": "off",
    },
  },
  {
    ignores: ["dist", "node_modules", "drizzle", "*.config.js", "components.json"],
  },
];
