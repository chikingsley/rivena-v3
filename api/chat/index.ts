import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateId } from 'ai'
import { handleChatRequest } from '@/lib/handler'
import { Readable } from 'stream'

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
    // Check if OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable')
      return res.status(500).json({ error: 'Server configuration error: Missing API key' })
    }

    const { messages, id = generateId() } = req.body

    // Use shared handler to process the chat request
    const result = await handleChatRequest({ messages, id })
    
    // Convert the result to a response
    const response = await result.toDataStreamResponse()
    
    // Copy headers from the response to our response
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value)
    }
    
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
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : ''
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    })
  }
} 