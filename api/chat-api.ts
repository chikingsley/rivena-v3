import type { VercelRequest, VercelResponse } from '@vercel/node'
import app from './index.js'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Convert the Vercel request to a fetch Request
  const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`)
  
  const request = new Request(url, {
    method: req.method,
    headers: new Headers(req.headers as Record<string, string>),
    body: req.body ? JSON.stringify(req.body) : undefined
  })
  
  // Use the Elysia fetch handler
  try {
    const response = await app(request)
    
    // Copy status and headers
    res.status(response.status)
    
    for (const [key, value] of response.headers.entries()) {
      res.setHeader(key, value)
    }
    
    // Handle response body
    const body = await response.text()
    res.send(body)
  } catch (error) {
    console.error('Error handling request:', error)
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 