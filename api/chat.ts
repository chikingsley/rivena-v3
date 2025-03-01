import { Elysia } from 'elysia'
import { createChat, loadChat } from '../src/lib/tools/chat-store.js'

export const chatApiRoutes = new Elysia({ prefix: '/api' })
  .post('/create-chat', async () => {
    const id = await createChat()
    return { id }
  })
  .get('/load-chat', async ({ query }) => {
    const id = query?.id as string
    if (!id) {
      return new Response('Chat ID is required', { status: 400 })
    }
    const messages = await loadChat(id)
    return { messages }
  })

export default chatApiRoutes 