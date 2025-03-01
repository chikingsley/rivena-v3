'use client'

import { useEffect, useState } from 'react'
import ChatPage from './chat-page'
import { Message } from '@ai-sdk/react'

export default function HomePage() {
  const [chatId, setChatId] = useState<string | null>(null)
  const [initialMessages, setInitialMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get the chat ID from the URL if available
    const urlParams = new URLSearchParams(window.location.search)
    const urlChatId = urlParams.get('id')
    
    if (urlChatId) {
      setChatId(urlChatId)
      loadChat(urlChatId)
    } else {
      // Create a new chat if no ID in URL
      createNewChat()
    }
  }, [])

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/create-chat', { method: 'POST' })
      const data = await response.json()
      setChatId(data.id)
      // Update URL with the new chat ID
      const newUrl = `${window.location.pathname}?id=${data.id}`
      window.history.pushState({ id: data.id }, '', newUrl)
      setLoading(false)
    } catch (error) {
      console.error('Failed to create chat:', error)
      setLoading(false)
    }
  }

  const loadChat = async (chatId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/load-chat?id=${chatId}`)
      const data = await response.json()
      setInitialMessages(data.messages)
    } catch (error) {
      console.error('Failed to load chat:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-xl p-8 bg-white rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div>Loading chat...</div>
          </div>
        </div>
      </div>
    )
  }

  return <ChatPage id={chatId || undefined} initialMessages={initialMessages} />
} 