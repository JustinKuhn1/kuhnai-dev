// app/page.tsx
import Chat from '@/components/Chat'
import NavBar from '@/components/NavBar'

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <main className="flex-1 p-4 overflow-hidden">
        <Chat />
      </main>
    </div>
  )
}