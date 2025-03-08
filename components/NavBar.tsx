// components/NavBar.tsx
'use client'

import Link from 'next/link'
//import { usePathname } from 'next/navigation'
import AuthButton from './AuthButton'
import Image from 'next/image'

export default function NavBar() {
  //const pathname = usePathname()
  
  return (
    <nav className="bg-white shadow dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
            <Image 
  className="h-8 w-8" 
  src="/images/logo.svg" 
  alt="Logo"
  width={32}
  height={32}
/>
              <span className="ml-2 text-xl font-bold">KuhnAI</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  )
}