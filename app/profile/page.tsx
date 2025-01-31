'use client';

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [discordId, setDiscordId] = useState(session?.user?.discordId || "");
  const [loading, setLoading] = useState(false);

  const handleSaveDiscordId = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/discord-id", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ discordId }),
      });
      if (!response.ok) throw new Error("Failed to save Discord ID");
      update({ discordId });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="w-40 h-6" />
        <Skeleton className="w-60 h-4" />
      </div>
    );
  }

  if (!session?.user) {
    return <p className="text-center text-red-500">Você precisa estar logado para ver esta página.</p>;
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-primary text-primary-foreground shadow-md rounded-lg mt-10">
      <div className="flex flex-col items-center">
        <Avatar className="w-24 h-24">
          <AvatarImage src={session.user.image ?? ""} alt={session.user.name ?? "User avatar"} />
          <AvatarFallback>{session.user.name?.[0] ?? "U"}</AvatarFallback>
        </Avatar>
        <h2 className="mt-4 text-xl font-bold">{session.user.name}</h2>
        <p className="text-primary-foreground">{session.user.email}</p>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-primary-foreground">Discord ID</label>
        <input
          type="text"
          className="w-full mt-1 p-2 border rounded-md text-black"
          placeholder="Enter your Discord ID"
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
        />
        <Button
          variant="secondary"
          onClick={handleSaveDiscordId}
          disabled={loading || !discordId.trim()}
          className="mt-2 w-full"
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="mt-6 flex justify-center">
        <Button variant="destructive" onClick={() => signOut()}>Logout</Button>
      </div>
    </div>
  );
}