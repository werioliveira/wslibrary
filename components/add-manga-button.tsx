"use client"

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from 'next-auth/react'
import { mutate } from 'swr'
import { toast, Toaster } from 'sonner'

export function AddMangaButton() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
          // Asserção para garantir que o target seja um formulário HTML
         const form = event.target as HTMLFormElement;
        try {
            const res = await fetch('/api/manga', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: (form.elements.namedItem('name') as HTMLInputElement)?.value,
                image: (form.elements.namedItem('image') as HTMLInputElement)?.value,
                chapter: (form.elements.namedItem('chapter') as HTMLInputElement)?.value,
                website: (form.elements.namedItem('website') as HTMLInputElement)?.value,
                linkToWebsite: (form.elements.namedItem('linkToWebsite') as HTMLInputElement)?.value,
                userId: session.user!.id,
              }),
            });
            mutate(`/api/manga?userId=${session.user!.id}`);
            if (!res.ok) toast.error("Erro ao adicionar manga!")
            toast.success("Manga adicionada com sucesso!")
          } catch (e) {
            toast.error("Erro ao adicionar manga!"+e)
          }
        setOpen(false)
    }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <Toaster richColors closeButton/>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 rounded-full w-14 h-14 shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] background-color-[#122A3D]">
        <DialogHeader>
          <DialogTitle>Add New Manga</DialogTitle>
          <DialogDescription>
            Enter the details of the manga you want to add to your tracker.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 background-color-[#122A3D]">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              className="col-span-3"
              placeholder="Manga name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="chapter" className="text-right">
              Chapter
            </Label>
            <Input
              id="chapter"
              type="number"
              className="col-span-3"
              placeholder="Current chapter"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              Image
            </Label>
            <Input
              id="image"
              type="text"
              className="col-span-3"
              placeholder="Image"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="website" className="text-right">
              Website Name
            </Label>
            <Input
              id="website"
              className="col-span-3"
              placeholder="Website Name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="linkToWebsite" className="text-right">
              Website URL
            </Label>
            <Input
              id="linkToWebsite"
              className="col-span-3"
              placeholder="Website URL"
            />
          </div>
          <Button type="submit" className="ml-auto">
            Add Manga
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

