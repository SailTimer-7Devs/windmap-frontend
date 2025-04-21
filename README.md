# Windmap

## Installation

In the project directory, need to start:

```bash
npm install  
```

or

```bash
npm i  
```

This command will directly install the required dependencies into the directory you specify. After this command
completes, you can start the application.

## Run development mode

Use on of the following commands, to start local development server:
```bash
make
# or
npm run dev
```

Starts the process of compiling and assembling the application from source code.
Special configs with the necessary settings are used in this process.

The result of a successful execution there will be information  about the time spent on assembly and the address: http://localhost:8000

## Create production build

Use next command to create production build:
```bash
npm run build
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json', './tsconfig.app.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
