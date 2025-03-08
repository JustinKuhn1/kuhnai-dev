// types/chat.ts

export interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
  }
  
  export interface Conversation {
    id: string
    title?: string
    messages: Message[]
    createdAt: string
    updatedAt: string
  }
  
  export interface StreamToken {
    token: string
    done: boolean
  }