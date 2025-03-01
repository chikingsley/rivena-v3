import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Message, streamText, appendResponseMessages } from 'ai'
import { openai } from '@ai-sdk/openai'
import { Readable } from 'stream'

// Simple in-memory store for testing
const chatStore: Record<string, Message[]> = {}

/**
 * Save chat messages to store
 */
async function saveChat(id: string, messages: Message[]): Promise<void> {
  chatStore[id] = messages
  console.log(`Chat ${id} saved with ${messages.length} messages`)
}

// Helper function to convert a web ReadableStream to a Node.js stream
function webStreamToNodeStream(webStream: ReadableStream): Readable {
  const nodeStream = new Readable({
    read() {}
  });

  const reader = webStream.getReader();
  
  function push() {
    reader.read().then(({ done, value }) => {
      if (done) {
        nodeStream.push(null);
        return;
      }
      nodeStream.push(Buffer.from(value));
      push();
    }).catch(err => {
      nodeStream.destroy(err);
    });
  }
  
  push();
  return nodeStream;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Processing chat request in serverless function')
    
    // Parse request body
    const { messages, id } = req.body as { 
      messages: Message[];
      id: string; 
    }
    
    if (!messages || !id) {
      return res.status(400).json({ error: 'Messages and ID are required' })
    }
    
    // Create the streaming text response
    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages,
      async onFinish({ response }) {
        // Save chat messages
        await saveChat(
          id, 
          appendResponseMessages({
            messages,
            responseMessages: response.messages,
          })
        )
      }
    })
    
    // Handle client disconnects
    result.consumeStream()
    
    // Convert the result to a response
    const response = await result.toDataStreamResponse()
    
    // Set essential headers for SSE
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    
    // Set the status code
    res.status(response.status)
    
    // Stream the response body
    const body = await response.body
    
    if (body) {
      // Convert Web ReadableStream to Node.js stream
      const nodeReadable = webStreamToNodeStream(body);
      nodeReadable.pipe(res);
    } else {
      res.end()
    }
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 