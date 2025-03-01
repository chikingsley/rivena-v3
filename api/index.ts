// src/api/index.ts
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import type { CompletionRequest } from '../src/lib/chat/types.js'
import { handleChatRequest } from '../src/lib/chat/handler.js'
import chatApiRoutes from './chat.js'

// Create the Elysia app with CORS enabled
const app = new Elysia()
  .use(cors())
  .post('/api/chat', async ({ body, request }) => {
    console.log('Processing chat completion request')
    
    // Process the request using shared handler
    const requestData = body as CompletionRequest
    return handleChatRequest(requestData, request.headers)
  })
  .get('/api/health', () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  })
  .use(chatApiRoutes)

// For local development, use .listen()
// For serverless (Vercel), use the fetch handler
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`🦊 Server is running at http://localhost:${PORT}`)
  })
}

// Export a fetch function for serverless environments
export default app

export type App = typeof app