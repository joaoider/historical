# Ider — frontend e PWA

## Instalar no iPhone

A PWA precisa ser publicada por HTTPS (endereços `localhost` são aceitos apenas
durante o desenvolvimento). Depois da publicação:

1. Abra a URL no Safari do iPhone.
2. Toque no botão **Compartilhar**.
3. Escolha **Adicionar à Tela de Início**.
4. Confirme em **Adicionar**.

O frontend usa `/api` por padrão. Em produção, configure o servidor para servir
o frontend e encaminhar `/api` ao backend, ou defina `VITE_API_URL` durante o
build com a URL HTTPS pública da API.

## Desenvolvimento

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
