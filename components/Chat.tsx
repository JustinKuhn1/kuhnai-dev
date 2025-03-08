// components/Chat.tsx - Corrected version
'use client'

import { useState, useEffect, useRef } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function Chat() {
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{role: string, content: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
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
        .select('message, response, timestamp')
        .order('timestamp', { ascending: true })
      
      if (historyError) {
        console.error('Error loading chat history:', historyError)
        return
      }
      
      if (data) {
        const formattedHistory = data.flatMap(item => [
          { role: 'user', content: item.message },
          { role: 'assistant', content: item.response }
        ])
        setChatHistory(formattedHistory)
      }
    }
    
    checkSessionAndLoadHistory()
  }, [supabase, router])
  
  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!message.trim()) return
    
    setIsLoading(true)
    setError(null)
    
    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: message }])
    
    try {
      // Get the user's session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        throw new Error('Not authenticated')
      }
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }
      
      const data = await response.json()
      
      // Add AI response to chat
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }])
      
      // Clear input
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Start a conversation with the AI
          </div>
        ) : (
          chatHistory.map((chat, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg ${
                chat.role === 'user' 
                  ? 'bg-blue-100 ml-auto max-w-3xl' 
                  : 'bg-gray-100 mr-auto max-w-3xl'
              }`}
            >
              {chat.content}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded-lg"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}