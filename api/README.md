# API Directory

This directory contains the Vercel serverless functions that power the backend API.

## Structure

- **`index.ts`** - The main Elysia app that defines API routes, exported as a fetch handler for serverless environments
- **`chat/index.ts`** - Dedicated endpoint for chat completion that works with Vercel's serverless function format
- **`root.ts`** - A direct adapter between Vercel requests and the Elysia app
- **`vercel.ts`** - A simple health check endpoint
- **`package.json`** - Defines this directory as an ES Module
- **`tsconfig.json`** - TypeScript configuration for the API

## Deployment

The functions in this directory are automatically deployed by Vercel when you push to the repository. 
The `vercel.json` file at the root of the project configures how these functions are deployed.

## Development

For local development, you can:

1. Run `npm run dev` to start the development server
2. Test API endpoints with tools like Postman or curl

## Notes

- The API functions use shared handlers from the `src/lib` directory
- All imports in TypeScript files must include the `.js` extension due to ESM requirements
- In serverless environments, the Elysia app exports a fetch handler instead of using `.listen()` 