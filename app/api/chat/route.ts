// app/api/chat/route.ts - Improved with streaming support
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'; // Use Edge runtime for better streaming support

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Parse request
    const { message, stream = false } = await req.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }
    
    // Call LLM API
    const llmApiUrl = process.env.LLM_API_URL
    const apiSecret = process.env.API_SECRET
    
    if (!llmApiUrl) {
      return NextResponse.json({ error: 'LLM API URL not configured' }, { status: 500 })
    }
    
    // Configure the request to Ollama
    const ollama = await fetch(llmApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiSecret ? { 'Authorization': `Bearer ${apiSecret}` } : {})
      },
      body: JSON.stringify({
        model: 'llama3', // Adjust based on your Ollama model
        prompt: message,
        stream: stream
      })
    })
    
    if (!ollama.ok) {
      const errorData = await ollama.json().catch(() => ({ error: 'Unknown error' }))
      console.error('LLM API error:', errorData)
      return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 })
    }
    
    // If streaming is requested and supported by the LLM API
    if (stream) {
      // Create a transform stream to process the response
      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          controller.enqueue(chunk);
        },
      });
      
      // Stream the response from Ollama to the client
      const responseStream = ollama.body;
      if (!responseStream) {
        return NextResponse.json({ error: 'Failed to get response stream' }, { status: 500 });
      }
      
      // Pipe the response stream through our transform stream
      responseStream.pipeTo(transformStream.writable);
      
      // Return the readable part of the transform stream
      return new Response(transformStream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // For non-streaming responses
      const result = await ollama.json()
      
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
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}