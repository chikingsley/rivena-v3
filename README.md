# Rivena V3

A modern AI chat application built with React, Vite, and Elysia.

## Local Development

### Prerequisites

- [Bun](https://bun.sh/) - Fast JavaScript runtime and package manager

### Setup

1. Install dependencies:

```bash
bun install
```

2. Run the development server:

```bash
# This will start both the Vite frontend and Elysia API server
bun run start
```

Alternatively, you can run them separately:

```bash
# Frontend only (Vite)
bun run dev

# API server only (Elysia)
bun run api
```

## How It Works

The application consists of three main parts:

1. **Frontend**: React application built with Vite
2. **Backend API**: Elysia server providing the chat API for local development
3. **Serverless Functions**: TypeScript functions for production deployment on Vercel
4. **Shared Handlers**: Core business logic shared between local and production environments

In development, the Vite dev server proxies `/api` requests to the Elysia server running on port 3000.

## Shared Architecture

This project uses a shared handler architecture to avoid code duplication:

- `/lib/chat/handler.ts` - Core chat handling logic used by both environments
- `/api/index.ts` - Elysia server for local development that imports the shared handler
- `/api/chat/index.ts` - Vercel serverless function that imports the same shared handler

This ensures that your chat functionality works consistently across environments.

## Deployment to Vercel

This project is configured to work seamlessly on Vercel with no code changes needed between development and production.

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy

In production, Vercel will use the TypeScript serverless functions in the `/api` directory.

## Project Structure

- `/src` - Frontend React application
- `/api` - Backend API server (Elysia) and Vercel serverless functions
- `/lib` - Shared utilities and business logic
  - `/lib/chat` - Shared chat handling logic

## Environment Variables

No environment variables are required for basic functionality. The API server will use port 3000 by default, but you can change it by setting the `PORT` environment variable.
