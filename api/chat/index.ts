import type { VercelRequest, VercelResponse } from '@vercel/node'
import { generateId } from 'ai'
import { handleChatRequest } from '../../src/lib/handler.js'
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
    // Log import path to help debug path resolution issues
    console.log('Handling chat request in dedicated serverless function');
    
    const { messages, id = generateId() } = req.body
    
    console.log(`Processing chat request with ${messages.length} messages`);

    // Use shared handler to process the chat request
    const result = await handleChatRequest({ messages, id })
    
    console.log('Chat request processed successfully');
    
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
    console.error('Chat error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // If it's a module resolution error, provide more details
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      console.error('Module resolution error - this usually indicates a path alias issue');
    }
    
    // More detailed error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(500).json({ 
      error: 'An error occurred while processing your request',
      message: errorMessage
    });
  }
} 