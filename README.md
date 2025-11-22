# Team Scoring 2024
Mechanism that allows obtaining an adjusted forecast for the completion of a particular task based on an analysis of deviations in forecasting similar tasks.

## Demo
https://pravosleva.pro/dist.estimate-corrector-2024

[Roadmap](https://pravosleva.pro/p/67723f368c79264aa7fd53b1)

## Generte documentation with [JSDoc](https://habr.com/ru/articles/572968/)
```shell
yarn _jsdoc-gen
```

### JSDoc: Basic
#### Step 1. Install deps
```shell
yarn add -D jsdoc
```

#### Step 2 `.gitignore`
```gitignore
## Docs
docs/*
```

#### Step 3. `jsdoc.json`
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

#### Step 3. Script
`package.json`
```json
{
  "scripts": {
    "_jsdoc-gen": "./node_modules/jsdoc/jsdoc.js -c jsdoc.json -d ./docs"
  }
}
```

#### Step 4. Usage
```shell
yarn _jsdoc-gen
```

### JSDoc: Other themes
- DocDash: https://github.com/clenemt/docdash
> `yarn add -D docdash`
> `jsdoc.json` -> `opts.template: "node_modules/docdash"`
- Minami: https://github.com/archiverjs/jsdoc-theme
- Clean: https://github.com/ankitskvmdam/clean-jsdoc-theme
> `yarn add clean-jsdoc-theme -D`
> `jsdoc.json` -> `opts.template: "node_modules/clean-jsdoc-theme"`
> `package.json` -> `scripts.generate-docs: "jsdoc --configure jsdoc.json --verbose"`
- BetterDocs: https://github.com/SoftwareBrothers/better-docs

## Vitepress
### Step 1. Install
```bash
yarn add -D vitepress
```

### Step 2. Settings
```bash
npx vitepress init
```

For example, u can set dir `tools.vitepress` as main for this tool

### Step 3. Scripts in `package.json`
```json
{
  "scripts": {
    "_vitepress-docs:dev": "./node_modules/vitepress/bin/vitepress.js dev tools.vitepress",
    "_vitepress-docs:build": "VITE_PUBLIC_URL=/dist.estimate-corrector-2024/vitepress/output ./node_modules/vitepress/bin/vitepress.js build tools.vitepress",
    "_vitepress-docs:postbuild": "bash _aux-tool.quaint-files-copy.sh tools.vitepress/output public/vitepress html && bash _aux-tool.quaint-files-copy.sh tools.vitepress/output public/vitepress css && bash _aux-tool.quaint-files-copy.sh tools.vitepress/output public/vitepress js",
    "_vitepress-docs:preview": "./node_modules/vitepress/bin/vitepress.js preview tools.vitepress"
  }
}
```

### Step 4. Config `tools.vitepress/.vitepress/config`

```ts
import { defineConfig } from 'vitepress'

const PUBLIC_URL = process.env.VITE_PUBLIC_URL || ''

export default defineConfig({
  // ...
  base: `${PUBLIC_URL}`,
  outDir: 'output',
  // ...
})
```

## Aux scripts
`./_aux-tool.quaint-files-copy.sh`
```bash
#!/bin/bash

# quaint_copy копирует файлы определённого расширения $3 из каталога $1 в
# каталог $2

quaint_copy(){
  srcDir=$1
  destDir=$2
  ext=$3
  
  rsync -r -f '+ *.'"$ext" -f '+ **/' -f '- *' --prune-empty-dirs $srcDir $destDir
}

quaint_copy $PWD/$1 $PWD/$2 $3
```

`./_aux-tool.dir-copy2.sh`
```bash
dir_copy() {
  srcDir=$1
  destDir=$2

  for i in $srcDir/*; do cp -r $i $destDir; done;
}
```

`./_aux-tool.read-env.sh`
```bash
#!/bin/bash

# NOTE: Read env name $1 from file $2 (optional: .env by default)

read_env() {
  if [ -z "$1" ]; then
    echo "environment variable name is required"
    return 1
  fi

  local ENV_FILE='.env'
  if [ ! -z "$2" ]; then
    ENV_FILE="$2"
  fi

  local VAR=$(grep $1 "$ENV_FILE" | xargs)
  IFS="=" read -ra VAR <<< "$VAR"
  echo ${VAR[1]}
}
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

## NGINX settings
```nginx
server {
  #...

  location /dist.estimate-corrector-2024 {
    index index.html;
    root /root/projects;
    autoindex on;
  }
}
```
