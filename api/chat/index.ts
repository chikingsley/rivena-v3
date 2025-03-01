import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleChatRequest } from '../../src/lib/handler.js'

// Helper to pipe a Web ReadableStream to a Node.js readable stream
function pipeWebStreamToResponse(webStream: ReadableStream, res: VercelResponse) {
  const reader = webStream.getReader()
  
  function pump() {
    reader.read().then(({ done, value }) => {
      if (done) {
        res.end()
        return
      }
      
      // Write chunk to response
      res.write(value)
      
      // Continue reading
      pump()
    }).catch(error => {
      console.error('Error reading stream:', error)
      res.end()
    })
  }
  
  pump()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Processing chat request in serverless function')
    
    // Extract the messages and ID from the request body
    const { messages, id } = req.body
    
    if (!messages || !id) {
      return res.status(400).json({ error: 'Messages and ID are required' })
    }
    
    // Process the chat request using shared handler
    const result = await handleChatRequest({ messages, id })
    
    // Convert the result to a streaming response
    const response = await result.toDataStreamResponse()
    
    // Copy headers from the response
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value)
    }
    
    // Set the status code
    res.status(response.status)
    
    // Stream the response body if present
    if (response.body) {
      pipeWebStreamToResponse(response.body, res)
    } else {
      res.end()
    }
  } catch (error) {
    console.error('Error processing chat request:', error)
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 