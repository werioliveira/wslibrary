'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

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
              <div className="relative">
                <Avatar onClick={toggleDropdown} className="cursor-pointer">
                  <AvatarImage
                    src={session.user.image ?? ""}
                    alt={session.user.name ?? "User avatar"}
                  />
                  <AvatarFallback>{session.user.name?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-10">
                    <Link href="/profile">
                      <Button variant="link" className="block w-full text-left px-4 py-2">
                        Profile
                      </Button>
                    </Link>
                    <Button
                      variant="link"
                      className="block w-full text-left px-4 py-2"
                      onClick={() => signOut()}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>
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
