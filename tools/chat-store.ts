// tools/chat-store.ts
import { Message } from 'ai'
import { generateId } from 'ai'

// Simple in-memory store for testing
const chatStore: Record<string, Message[]> = {}

export async function createChat(): Promise<string> {
  const id = generateId()
  chatStore[id] = []
  return id
}

export async function loadChat(id: string): Promise<Message[]> {
  return chatStore[id] || []
}

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