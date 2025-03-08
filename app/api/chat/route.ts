// app/api/chat/route.ts - Corrected for Ollama API
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
    
    // Format the correct Ollama endpoint
    const ollamaEndpoint = `${llmApiUrl}/api/generate`
    console.log('Calling Ollama at:', ollamaEndpoint)
    
    // Configure the request to Ollama
    const ollama = await fetch(ollamaEndpoint, {
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
      const errorText = await ollama.text();
      console.error('LLM API error status:', ollama.status);
      console.error('LLM API error response:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json({ 
          error: 'Failed to generate response', 
          details: errorData 
        }, { status: 500 });
      } catch {
        return NextResponse.json({ 
          error: 'Failed to generate response', 
          details: errorText 
        }, { status: 500 });
      }
    }
    
    // If streaming is requested and supported by the LLM API
    if (stream) {
      // Pass through the Ollama response directly
      return new Response(ollama.body, {
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
          response: result.response || "",
          timestamp: new Date().toISOString()
        })
      
      return NextResponse.json({ response: result.response })
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}