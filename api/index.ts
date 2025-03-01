// src/api/index.ts
import { Elysia } from 'elysia'
import { Message } from 'ai'
import chatApiRoutes from './chat.js'
import { handleChatRequest } from '../src/lib/handler.js'

// Main chat completion endpoint
const chatCompletionRoute = new Elysia()
  .post('/api/chat', async ({ body }) => {
    // Add proper type validation for the request body
    const { messages, id } = body as { 
      messages: Message[];
      id: string; 
    }
    
    const result = await handleChatRequest({ messages, id })
    
    // Use the data stream method from AI SDK which returns a Response
    return result.toDataStreamResponse()
  })

// Combine all routes but don't listen - use fetch handler instead
const app = new Elysia()
  .use(chatCompletionRoute)
  .use(chatApiRoutes)

// Export the fetch handler for serverless environments
export default app.fetch

// For local development, you can uncomment this:
// if (process.env.NODE_ENV !== 'production') {
//   const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000
//   app.listen(PORT)
//   console.log(`Elysia server is running at ${app.server?.hostname}:${PORT}`)
// }

export type App = typeof app