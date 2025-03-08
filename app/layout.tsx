import './globals.css'
import { Inter } from 'next/font/google'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Chat - Powered by Ollama',
  description: 'Chat with an AI assistant powered by Ollama',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  // We're not using session here, so we can remove it or comment it out
  // const { data: { session } } = await supabase.auth.getSession()
  
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        {children}
      </body>
    </html>
  )
}