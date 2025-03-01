// src/api/index.ts
import { Elysia } from 'elysia'
import { Message, streamText, appendResponseMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import chatApiRoutes from './chat.ts'

// Simple in-memory store for testing
const chatStore: Record<string, Message[]> = {}

/**
 * Save chat messages to store
 */
async function saveChat(id: string, messages: Message[]): Promise<void> {
  chatStore[id] = messages
  console.log(`Chat ${id} saved with ${messages.length} messages`)
}

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
    
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages,
      async onFinish({ response }) {
        // Save chat messages using the proper helper function
        await saveChat(
          id, 
          appendResponseMessages({
            messages,
            responseMessages: response.messages,
          })
        )
      },
    })
    
    // Handle client disconnects
    result.consumeStream()
    
    // Return streaming response
    return result.toDataStreamResponse()
  })

// Combine all routes
const app = new Elysia()
  .use(chatCompletionRoute)
  .use(chatApiRoutes)
  .listen(PORT)

console.log(`Elysia server is running at ${app.server?.hostname}:${PORT}`)

export type App = typeof app