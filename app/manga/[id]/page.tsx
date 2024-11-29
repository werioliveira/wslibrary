"use client";

import { use, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Toaster, toast } from 'sonner'
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Manga {
  id: string;
  name: string;
  image: string;
  chapter: number;
  linkToWebsite: string;
}


export default function MangaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Resolva a Promise usando o hook `use`
  
  const [manga, setManga] = useState<Manga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const route = useRouter()
  useEffect(() => {
    const fetchManga = async () => {
      try {
        const response = await fetch(`/api/manga/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch manga data.");
        }
        const data = await response.json();
        setManga(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchManga();
  }, [id]);

  const updateChapter = (increment: number) => {
    setManga((prev) =>
      prev
        ? {
            ...prev,
            chapter: Math.max(0, prev.chapter + increment),
          }
        : null
    );
  };
  const saveChapterToDatabase = async () => {
    if (!manga) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/manga/${manga.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapter: manga.chapter }),
      });

      if (!response.ok) {
        toast.error("Error updating chapter!");
        //throw new Error("Failed to update chapter in database.");
      }

      toast.success("Chapter updated successfully!");

    } catch (error) {
        toast.error("Error updating chapter!" + error);
    } finally {
      setIsUpdating(false);

    }
  };
  const deleteManga = async () => {
    if (!manga) return;
    try {
        const response = await fetch(`/api/manga/${id}`, {
          method: "DELETE",
        });
    
        if (!response.ok) {
          toast.error("Failed to delete manga");
        }
        toast.success("Manga deleted successfully!");
        route.push("/");
      } catch (error) {
        console.error("Error deleting manga:", error);

        toast.error("Error deleting manga");
      }
  };
  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!manga) {
    return <p>No manga found.</p>;
  }

  return (
    <>
    <Toaster richColors closeButton/>
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative w-full md:w-1/3 aspect-[3/4] text-center">
              <img
                src={manga.image}
                alt={manga.name}
                
                className="object-cover rounded-lg"
                />
                <Link className="text-xl font-bold mb-4 text-gray" target="_blank" href={manga.linkToWebsite}>Acessar Site</Link>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-4">{manga.name}</h1>
              
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Current Chapter</h2>
                  <div className="flex items-center">
                    <div className="w-20 text-center">
                      <span className="text-3xl font-bold transition-all duration-200">{manga.chapter}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateChapter(1)}
                        aria-label="Increase chapter"
                        >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateChapter(-1)}
                        aria-label="Decrease chapter"
                        >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button onClick={() => updateChapter(1)} className="w-full">
                  Mark Next Chapter as Read
                </Button>
                <Button
                  onClick={saveChapterToDatabase}
                  className="w-full"
                  disabled={isUpdating}
                  >
                  {isUpdating ? "Updating..." : "Save Chapter to Database"}
                </Button>
                <Button
                  onClick={deleteManga}
                  className="w-full"
                  disabled={isUpdating}
                  variant="destructive"
                  >
                  {isUpdating ? "Deletando..." : "Deletar Manga"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
     </>
  );
}
