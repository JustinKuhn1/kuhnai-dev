// components/ChatMessage.tsx
'use client'

import { useEffect, useState } from 'react'
import { marked } from 'marked'

interface ChatMessageProps {
  role: string
  content: string
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const [renderedContent, setRenderedContent] = useState('')
  
  useEffect(() => {
    // Parse markdown content
    if (content) {
      marked.setOptions({
        breaks: true,
        gfm: true
      })
      
      const parseContent = async () => {
        const parsedContent = await marked.parse(content)
        setRenderedContent(parsedContent)
      }
      parseContent()
    } else {
      setRenderedContent('')
    }
  }, [content])
  
  return (
    <div 
      className={`p-4 rounded-lg ${
        role === 'user' 
          ? 'bg-blue-500 text-white ml-auto max-w-3xl' 
          : 'bg-gray-700 text-white mr-auto max-w-3xl'
      }`}
    >
      <div 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: renderedContent }} 
      />
      
      {/* While content is empty, show loading indicator */}
      {content === '' && (
        <div className="flex space-x-2 justify-center items-center h-6">
          <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="h-2 w-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      )}
    </div>
  )
}