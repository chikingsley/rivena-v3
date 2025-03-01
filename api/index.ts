// src/api/index.ts
import { Elysia } from 'elysia'
import { Message } from 'ai'
import chatApiRoutes from '@/api/chat'
import { handleChatRequest } from '@/lib/handler'

// Get port from environment variable or use 3000 as default
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000

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

// Combine all routes
const app = new Elysia()
  .use(chatCompletionRoute)
  .use(chatApiRoutes)
  .listen(PORT)

console.log(`Elysia server is running at ${app.server?.hostname}:${PORT}`)

export type App = typeof app