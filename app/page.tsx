"use client"

import { signIn, useSession } from "next-auth/react"

import { Button } from "@/components/ui/button"
import {MangaCard} from "@/components/manga-card"
import { AddMangaButton } from "@/components/add-manga-button"
import { useMangas } from "@/hooks/useMangas"
import { MangaContainer } from "@/components/manga-container"



export default function Home() {

  const { data: session } = useSession()

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">My Manga Tracker</h1>
      {session ? (
        <>

          <MangaContainer/>
        <AddMangaButton />
          </>
      ) : (
        <div className="text-center">
          <p className="mb-4">Please log in to view your manga list.</p>
          <Button onClick={() => signIn('google')}>Login with Google</Button>
        </div>
      )}
    </main>
  )
}

