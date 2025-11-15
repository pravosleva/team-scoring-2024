# Team Scoring 2024
Mechanism that allows obtaining an adjusted forecast for the completion of a particular task based on an analysis of deviations in forecasting similar tasks.

[Roadmap](https://pravosleva.pro/p/67723f368c79264aa7fd53b1)

## JSDoc
### Step 1. Install deps
```shell
yarn add -D jsdoc
```

### Step 2 `.gitignore`
```gitignore
## Docs
docs/*
```

### Step 3. `jsdoc.json`
```json
{
  "source": {
    "include": [
      "./src",
      "./public"
    ],
    "includePattern": ".+\\.js(doc|x)?$",
    "excludePattern": "(^|\\/|\\\\)_"
  },
  "opts": {
    "destination": "./docs",
    "recurse": true,
    "template": "templates/default"
  }
}
```

### Step 3. Script
`package.json`
```json
{
  "scripts": {
    "_jsodc-gen": "./node_modules/jsdoc/jsdoc.js -c jsdoc.json -d ./docs"
  }
}
```

### Step 4. Usage
```shell
yarn _jsodc-gen
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
