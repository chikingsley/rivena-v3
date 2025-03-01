import type { VercelRequest, VercelResponse } from '@vercel/node'
import app from './index.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Bail out early for invalid requests
  if (!req.url) {
    return res.status(400).json({ error: 'Invalid request URL' })
  }
  
  // Create Request object for Elysia
  const url = new URL(req.url, `https://${req.headers.host || 'localhost'}`)
  
  // Process request body
  let body = undefined
  if (req.body && Object.keys(req.body).length > 0) {
    body = JSON.stringify(req.body)
  }
  
  // Create the request
  const request = new Request(url.toString(), {
    method: req.method || 'GET',
    headers: new Headers(req.headers as Record<string, string>),
    body
  })
  
  try {
    // Call Elysia app with the request
    console.log(`Processing ${req.method} request to ${url.pathname}`)
    const response = await app(request)
    
    // Copy status
    res.status(response.status)
    
    // Copy headers
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value)
    }
    
    // Check if response is streaming (used for chat completion)
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      // It's a streaming response, pipe it through
      if (!response.body) {
        res.end()
        return
      }
      
      const reader = response.body.getReader()
      
      reader.read().then(function process({ done, value }) {
        if (done) {
          res.end()
          return Promise.resolve()
        }
        
        res.write(value)
        return reader.read().then(process)
      })
    } else {
      // Regular response, just send the body
      const text = await response.text()
      res.send(text)
    }
  } catch (error) {
    console.error('Error processing request:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 