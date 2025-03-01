import { Elysia } from 'elysia'
import { Message } from 'ai'

// Simple in-memory store for testing (shared with the main handler)
const chatStore: Record<string, Message[]> = {}

/**
 * Load chat messages from store
 */
async function loadChat(id: string): Promise<Message[]> {
  return chatStore[id] || []
}

export const chatApiRoutes = new Elysia({ prefix: '/api' })
  .post('/create-chat', async () => {
    // Create a random ID
    const id = Math.random().toString(36).substring(2, 15)
    // Initialize empty chat
    chatStore[id] = []
    return { id }
  })
  .get('/load-chat', async ({ query }) => {
    const id = query?.id as string
    if (!id) {
      return new Response('Chat ID is required', { status: 400 })
    }
    // Load messages from the chat store
    const messages = await loadChat(id)
    return { messages }
  })
  
  // Health check endpoint
  .get('/health', () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
  })

export default chatApiRoutes 