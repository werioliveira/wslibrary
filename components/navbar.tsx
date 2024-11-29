"use client"

import Link from 'next/link'
import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Manga Tracker
        </Link>
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="hidden sm:inline">Welcome, {session.user?.name}</span>
              <Avatar>
                <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? 'User avatar'} />
                <AvatarFallback>{session.user?.name?.[0] ?? 'U'}</AvatarFallback>
              </Avatar>
              <Button variant="secondary" onClick={() => signOut()}>
                Logout
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => signIn('google')}>
              Login with Google
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}

