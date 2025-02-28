# Learning Remix with React 🚀

This project was created as a hands-on learning exercise to explore Remix with React. The goal is to understand the core concepts of Remix and apply them to build a functional web application.

[![Remix Docs](https://img.shields.io/badge/Remix-Docs-blue)](https://remix.run/docs)

## Table of Contents

- [About This Project 📚](#about-this-project-📚)
- [Development 🛠](#development-🛠)
- [Deployment 🚀](#deployment-🚀)
- [Prisma Commands 🗄](#prisma-commands-🗄)
- [Testing 🧪](#testing-🧪)

## About This Project 📚

This project is created as a learning exercise to dive into Remix with React. The goal is to understand Remix’s core concepts while building a functional web application, which will eventually serve as a portfolio piece.

## Development 🛠

To start the app in development mode, run:

```sh
npm run dev
```

This command launches the application and automatically rebuilds assets when files change.

## Deployment 🚀

### Production Build

1. **Build the Project:**

    ```sh
    npm run build
    ```

2. **Start the Production Server:**

    ```sh
    npm start
    ```

Choose a hosting provider to deploy your app. For DIY deployments, the built-in Remix app server is production-ready. Make sure to deploy the outputs from the `remix build`:

- `build/`
- `public/build/`

## Prisma Commands 🗄

Manage your database with Prisma using the following commands:

- **Seed Database:**

    ```sh
    npx prisma db seed
    ```

- **Sync Database Schema:**

    ```sh
    npx prisma db push
    ```

- **Generate Prisma Client:**

    ```sh
    npx prisma generate
    ```

## Testing 🧪

Ensure code quality with these commands:

- **Type Checking:**

    ```sh
    npm run typecheck
    ```

- **Unit and Feature Testing:**

    ```sh
    npm run test
    ```