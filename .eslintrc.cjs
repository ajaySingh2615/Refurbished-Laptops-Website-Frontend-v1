module.exports = {
  env: { browser: true, es2022: true },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/recommended",
    "prettier",
  ],
  settings: { react: { version: "detect" } },
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  rules: { "react/react-in-jsx-scope": "off" },
};
