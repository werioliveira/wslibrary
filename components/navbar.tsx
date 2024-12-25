'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export function Navbar() {
  const { data: session, status, update } = useSession();
  const [discordId, setDiscordId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveDiscordId = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/discord-id', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ discordId }),
      });
      if (!response.ok) {
        throw new Error('Failed to save Discord ID');
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      update({discordId: discordId});
    }
  };

  return (
<nav className="bg-primary text-primary-foreground">
  <div className="container mx-auto px-4 py-3 flex justify-between items-center">
    <Link href="/" className="text-xl font-bold">
      Manga Tracker
    </Link>
    <div className="flex items-center gap-4">
      {status === "loading" ? (
        <>
          <Skeleton className="w-32 h-4 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-20 h-10 rounded-md" />
        </>
      ) : status === "authenticated" && session?.user ? (
        <>
          <span className="hidden sm:inline">Welcome, {session.user.name}</span>
          <Avatar>
            <AvatarImage
              src={session.user.image ?? ""}
              alt={session.user.name ?? "User avatar"}
            />
            <AvatarFallback>{session.user.name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
          <Button variant="secondary" onClick={() => signOut()}>
            Logout
          </Button>
          {!session.user.discordId && (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter Discord ID"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                className="px-2 py-1 border rounded-md text-black"
              />
            <Button variant="secondary" 
                onClick={handleSaveDiscordId}
                disabled={loading || !discordId.trim()}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <Button variant="secondary" onClick={() => signIn("google")}>
          Login with Google
        </Button>
      )}
    </div>
  </div>
</nav>

  );
}
