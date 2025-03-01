'use client'

import { Message } from 'ai'
import { Chat } from '@/components/chat'

interface ChatPageProps {
  id?: string;
  initialMessages?: Message[];
}

export default function ChatPage({ id, initialMessages = [] }: ChatPageProps) {
  return (
    <div className="h-full flex flex-col">
      <Chat id={id} initialMessages={initialMessages} />
    </div>
  );
}