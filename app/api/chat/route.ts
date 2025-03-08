// app/api/chat/route.ts - Corrected version
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Parse request
    const { message } = await req.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    
    // Call LLM API
    const llmApiUrl = process.env.LLM_API_URL
    const apiSecret = process.env.API_SECRET
    
    if (!llmApiUrl) {
      return NextResponse.json({ error: 'LLM API URL not configured' }, { status: 500 })
    }
    
    const response = await fetch(llmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiSecret ? { 'Authorization': `Bearer ${apiSecret}` } : {})
      },
      body: JSON.stringify({
        model: 'llama3', // Adjust based on your Ollama model
        prompt: message,
        stream: false
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error('LLM API error:', errorData)
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
    }
    
    const result = await response.json()
    
    // Log conversation to database
    await supabase
      .from('conversations')
      .insert({
        user_id: session.user.id,
        message: message,
        response: result.response,
        timestamp: new Date().toISOString()
      })
    
    return NextResponse.json({ response: result.response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}