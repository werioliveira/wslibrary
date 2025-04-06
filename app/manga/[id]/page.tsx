"use client";

import { use, useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronUp,
  ChevronDown,
  Edit,
  ExternalLink,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import MangaPageSkeleton from "@/components/manga-page-skeleton";
import ShareSection from "@/components/ShareSection";

interface Manga {
  id: string;
  name: string;
  secondName?: string;
  image: string;
  chapter: number;
  linkToWebsite: string;
  status: string;
  website: string;
  shareId: string;
  hasNewChapter: boolean;
  newChapter: NewChapter,
}

interface NewChapter {
  chapter: number;
  source: string;
  link: string;
}

export default function MangaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // Resolva a Promise usando o hook `use`

  const [manga, setManga] = useState<Manga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Manga | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const route = useRouter();
  useEffect(() => {
    const fetchManga = async () => {
      try {
        const response = await fetch(`/api/manga/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch manga data.");
        }
        const data = await response.json();
        setManga(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchManga();
  }, [id]);
  const handleEdit = () => {
    
    setEditData(manga); // Preenche o formulário com os dados atuais
    setIsEditing(true);
  };


  const handleFileUpload = async () => {
    if (!fileInputRef.current || !fileInputRef.current.files?.length || !manga) return;
  
    const file = fileInputRef.current.files[0];
  
    try {
      // Converter o arquivo para base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
  
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(",")[1]; // Remove o prefixo `data:...`
  
        // Fazer o upload diretamente para o backend
        const response = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, mangaId: manga.id, fileContent: base64Content }),
        });
  
        if (!response.ok) throw new Error("Failed to upload file");
  
        const { imageUrl } = await response.json();
  
        // Atualizar o estado do mangá com a nova imagem
        setManga((prev) => (prev ? { ...prev, image: imageUrl } : null));
  
        toast.success("Image uploaded successfully!");
      };
  
      reader.onerror = () => {
        throw new Error("Failed to read file");
      };
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload image.");
    }
  };
  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editData) return;

    try {

      const response = await fetch(`/api/manga/${editData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (!response.ok) toast.error("Error updating manga.");
      setManga(editData); // Atualiza os dados locais
      
    } catch (err) {
      toast.error("Error updating manga."+err);
    } finally {
      setIsEditing(false);
      toast.success("Manga updated successfully!");
      
    }
  };
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
      
    } catch (error) {
      toast.error("Error updating chapter!" + error);
    } finally {
      setIsUpdating(false);
      toast.success("Chapter updated successfully!");
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
    return (
      <MangaPageSkeleton/>
    )
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!manga) {
    return <p>No manga found.</p>;
  }

  return (
    <>
      <Toaster richColors closeButton />
      <div className="container mx-auto py-8 px-4">
      <Card className="bg-zinc-950 border-zinc-800 overflow-hidden">
  <CardContent className="p-0">
    <div className="flex flex-col md:flex-row">
      <div className="relative md:w-1/3 aspect-[3/4]">
        <img
          src={manga.image ? manga.image :  "/defaultmanga.webp"}
          alt={manga.name}
          className="w-full h-full object-cover rounded-t-md md:rounded-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center items-center text-center">
          <Link
            href={manga.linkToWebsite}
            target="_blank"
            className="website-link text-white text-lg font-semibold"
          >
            {manga.website}
          </Link>
        </div>
      </div>
      
      <div className="flex-1 p-6 bg-zinc-950 rounded-b-md md:rounded-none">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-2xl font-bold text-white">{manga.name}</h1>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleEdit}
              aria-label="Edit manga"
            >
              <Edit className="h-4 w-4" />
            
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="py-2">
            <h2 className="text-lg font-semibold text-zinc-300 mb-2">Current Chapter</h2>
            <div className="flex items-center">
              <div className="w-20 text-center">
                <span className="text-3xl font-bold text-white">{manga.chapter}</span>
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

          <div className="space-y-2">

            <Button
              onClick={() => updateChapter(1)}
              className="w-full bg-zinc-800 hover:bg-zinc-700"
            >
              Mark Next Chapter as Read
            </Button>

            <Button
              onClick={saveChapterToDatabase}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Save Chapter to Database"}
            </Button>

            <Button
              onClick={deleteManga}
              className="w-full bg-red-900 hover:bg-red-800 text-white"
              disabled={isUpdating}
            >
              {isUpdating ? "Deleting..." : "Delete Manga"}
            </Button>
            <div className="mt-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white"
        >
          Upload Image
        </Button>
        <ShareSection manga={manga} setManga={setManga} />
      </div>
            {manga.hasNewChapter && manga.newChapter && (
      <div className="py-2 mb-4">
        <h2 className="text-lg font-semibold text-zinc-300 mb-2">New Chapter Available</h2>
        <div className="bg-zinc-800 p-3 rounded-md">
          <p className="text-white mb-2">
            Chapter {manga.newChapter.chapter} - {manga.newChapter.source}
          </p>
          <a
            href={manga.newChapter.link}
            target="_blank"
            className="text-blue-400 hover:text-blue-300 flex items-center"
          >
            Read Now <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </div>

      </div>
    )}
          </div>
        </div>
      </div>
    </div>


  </CardContent>
</Card>

        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
          <h2 className="text-xl font-bold text-white mb-4">Edit Manga</h2>
          <form className="space-y-4" onSubmit={handleSave}>
            <div>
              <label className="text-zinc-400">Name</label>
              <input
                type="text"
                value={editData?.name || ""}
                onChange={(e) =>
                  setEditData({ ...editData!, name: e.target.value })
                }
                className="w-full bg-zinc-800 text-white p-2 rounded"
              />
            </div>
            <div>
              <label className="text-zinc-400">Alternative Name</label>
              <input
                type="text"
                value={editData?.secondName || ""}
                onChange={(e) =>
                  setEditData({ ...editData!, secondName: e.target.value })
                }
                className="w-full bg-zinc-800 text-white p-2 rounded"
              />
            </div>
            <div>
              <label className="text-zinc-400">Image URL</label>
              <input
                type="text"
                value={editData?.image || ""}
                onChange={(e) =>
                  setEditData({ ...editData!, image: e.target.value })
                }
                className="w-full bg-zinc-800 text-white p-2 rounded"
              />
            </div>
            <div>
              <label className="text-zinc-400">Chapter</label>
              <input
                type="number"
                value={editData?.chapter || ""}
                onChange={(e) =>
                  setEditData({ ...editData!, chapter: Number(e.target.value) })
                }
                className="w-full bg-zinc-800 text-white p-2 rounded"
              />
            </div>
            <div>
              <label className="text-zinc-400">Website Link</label>
              <input
                type="text"
                value={editData?.linkToWebsite || ""}
                onChange={(e) =>
                  setEditData({ ...editData!, linkToWebsite: e.target.value })
                }
                className="w-full bg-zinc-800 text-white p-2 rounded"
              />
            </div>
            <div>
              <label className="text-zinc-400">Website Name</label>
              <input
                type="text"
                value={editData?.website || ""}
                onChange={(e) =>
                  setEditData({ ...editData!, website: e.target.value })
                }
                className="w-full bg-zinc-800 text-white p-2 rounded"
              />
            </div>

            <div>
      <label className="text-zinc-400">Status</label>
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => setEditData({ ...editData!, status: "Lendo" })}
          className={`px-4 py-2 rounded ${
            editData?.status === "Lendo"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          Lendo
        </button>
        <button
          type="button"
          onClick={() => setEditData({ ...editData!, status: "PretendoLer" })}
          className={`px-4 py-2 rounded ${
            editData?.status === "PretendoLer"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          Pretendo Ler
        </button>
        <button
          type="button"
          onClick={() => setEditData({ ...editData!, status: "Dropado" })}
          className={`px-4 py-2 rounded ${
            editData?.status === "Dropado"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          Dropado
        </button>
        <button
          type="button"
          onClick={() => setEditData({ ...editData!, status: "Concluido" })}
          className={`px-4 py-2 rounded ${
            editData?.status === "Concluido"
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400"
          }`}
        >
          Concluido
        </button>
      </div>
    </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500"
            >
              Save Changes
            </Button>
          </form>
        </Modal>
      </div>
    </>
  );
}