import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Return diagnostic information
  return res.status(200).json({
    env: {
      // Only report if keys exist, not their values (for security)
      NODE_ENV: process.env.NODE_ENV,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    },
    imports: {
      // Report if imports are available
      vercelTypesImported: true,
    },
    time: new Date().toISOString(),
  })
} 