// components/Chat.tsx - Improved with streaming
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

export default function Chat() {
  const [chatHistory, setChatHistory] = useState<Array<{id: string, role: string, content: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const supabase = createClientComponentClient()
  const router = useRouter()
  
  // Check session and load chat history
  useEffect(() => {
    async function checkSessionAndLoadHistory() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }
      
      const { data, error: historyError } = await supabase
        .from('conversations')
        .select('id, message, response, timestamp')
        .order('timestamp', { ascending: true })
      
      if (historyError) {
        console.error('Error loading chat history:', historyError)
        return
      }
      
      if (data) {
        const formattedHistory = data.flatMap(item => [
          { id: `user-${item.id}`, role: 'user', content: item.message },
          { id: `assistant-${item.id}`, role: 'assistant', content: item.response }
        ])
        setChatHistory(formattedHistory)
      }
    }
    
    checkSessionAndLoadHistory()
  }, [supabase, router])
  
  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, streamingContent])
  
  async function handleSendMessage(message: string) {
    if (!message.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    // Generate a temporary ID for the messages
    const tempId = Date.now().toString()
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { id: `user-${tempId}`, role: 'user', content: message }])
    
    try {
      // Get the user's session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        throw new Error('Not authenticated')
      }
      
      // Add placeholder for streaming response
      setChatHistory(prev => [...prev, { id: `assistant-${tempId}`, role: 'assistant', content: '' }])
      
      // Create streaming response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, stream: true })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }
      
      // Handle streaming or non-streaming response
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader()
        if (!reader) throw new Error('Failed to get stream reader')
        
        let accumulatedContent = ''
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          // Process the chunk
          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '))
          
          for (const line of lines) {
            const jsonString = line.replace('data: ', '').trim()
            if (jsonString === '[DONE]') continue
            
            try {
              const { token } = JSON.parse(jsonString)
              if (token) {
                accumulatedContent += token
                // Update the last message with the accumulated content
                setChatHistory(prev => 
                  prev.map(msg => 
                    msg.id === `assistant-${tempId}` 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                )
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e)
            }
          }
        }
      } else {
        // Handle non-streaming response
        const data = await response.json()
        setChatHistory(prev => 
          prev.map(msg => 
            msg.id === `assistant-${tempId}` 
              ? { ...msg, content: data.response }
              : msg
          )
        )
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      console.error('Chat error:', err)
      
      // Remove the assistant message if there was an error
      setChatHistory(prev => prev.filter(msg => msg.id !== `assistant-${tempId}`))
    } finally {
      setIsLoading(false)
      setStreamingContent('')
    }
  }
  
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Start a conversation with the AI
          </div>
        ) : (
          chatHistory.map((chat) => (
            <ChatMessage 
              key={chat.id}
              role={chat.role}
              content={chat.content}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 mx-4">
          {error}
        </div>
      )}
      
      <div className="p-4 border-t">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}