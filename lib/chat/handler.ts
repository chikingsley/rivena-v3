import { Message, streamText, appendResponseMessages } from 'ai'
import { openai } from '@ai-sdk/openai'

// Simple in-memory store for testing
const chatStore: Record<string, Message[]> = {}

/**
 * Save chat messages to store
 */
export async function saveChat({
  id,
  messages,
}: {
  id: string
  messages: Message[]
}): Promise<void> {
  chatStore[id] = messages
  console.log(`Chat ${id} saved with ${messages.length} messages`)
}

/**
 * Load chat messages from store
 */
export async function loadChat(id: string): Promise<Message[]> {
  return chatStore[id] || []
}

/**
 * Process a chat request and return a streaming response
 */
export async function handleChatRequest({
  messages,
  id,
}: {
  messages: Message[]
  id: string
}) {
  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
    async onFinish({ response }) {
      await saveChat({
        id,
        messages: appendResponseMessages({
          messages,
          responseMessages: response.messages,
        }),
      })
    },
  })
  
  // Handle client disconnects
  result.consumeStream()
  
  return result
} 