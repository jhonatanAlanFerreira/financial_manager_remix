# Learning Remix with React 🚀

This project was created as a hands-on learning exercise to explore Remix with React. The goal is to understand the core concepts of Remix and apply them to build a functional web application.

[![Remix Docs](https://img.shields.io/badge/Remix-Docs-blue)](https://remix.run/docs)

![Demo GIF showing the app in action](public/screenshots/main.gif)

![Demo GIF showing the app in action](public/screenshots/login_and_docs.gif)

## Tech Stack

### Core

- **Remix** – Full-stack React framework
- **React** – Frontend library
- **TypeScript** – Typed JavaScript
- **MongoDB** – NoSQL database
- **Docker** – Containerized environment
- **Tailwind CSS** – Utility-first CSS framework
- **Swagger** – API documentation
- **GraphQL** – Query language for APIs
- **Prisma** – A modern ORM providing type-safe database access and streamlined migrations

### Additional Libraries

- **Zustand** – State management
- **DataLoader** – Batch and cache DB requests
- **react-feather** – Icon set
- **react-responsive-modal** – Modal component

## Development 🛠

To start the app in development mode outside of Docker, run:

```sh
npm run dev
```

This command launches the application and automatically rebuilds assets when files change.

## Docker Deployment 🚀

Follow these steps to set up and run the application using Docker Compose:

1. **Clone the Repository:**

   ```sh
   git clone git@github.com:jhonatanAlanFerreira/financial_manager_remix.git
   cd financial_manager_remix
   ```

2. **Set Up Environment Variables:**

   Copy the example environment file and modify it as needed (for example, to change port settings):

   ```sh
   cp .env.example .env
   ```

3. **Start the Containers:**

   Run the following command to start all containers in detached mode:

   ```sh
   docker-compose up -d
   ```

4. **Check the Front-End Build Logs:**

   To confirm that the front-end has built successfully, check the logs for the `financial_manager_app` container:

   ```sh
   docker-compose logs financial_manager_app
   ```

   You should see log messages similar to:

   ```
   [info] building...
   [info] built (34.1s)
   [remix-serve] http://localhost:3000
   ```

   Wait until you see the "built" message along with the URL before accessing the app in your browser.

> **Note:** If you're new to Docker or Docker Compose, please refer to the [Docker Documentation](https://docs.docker.com) for more details on how Docker works and how to troubleshoot common issues.

## Prisma Commands 🗄

Since the application is running inside Docker containers, you should run these commands within the appropriate container. For example, to execute a command in the `financial_manager_app` container, use:

```sh
docker-compose exec financial_manager_app npx prisma db seed
```

Below are some common Prisma commands to manage your database:

- **Seed Database:**

  ```sh
  docker-compose exec financial_manager_app npx prisma db seed
  ```

- **Sync Database Schema:**

  ```sh
  docker-compose exec financial_manager_app npx prisma db push
  ```

- **Generate Prisma Client:**

  ```sh
  docker-compose exec financial_manager_app npx prisma generate
  ```

## Testing 🧪

Similarly, to run tests or type checking within the Docker container, execute the commands inside the container. For example:

- **Type Checking:**

  ```sh
  docker-compose exec financial_manager_app npm run typecheck
  ```

- **Unit and Feature Testing:**

  ```sh
  docker-compose exec financial_manager_app npm run test
  ```

---
