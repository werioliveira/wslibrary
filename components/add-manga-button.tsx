"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { mutate } from "swr";
import { toast, Toaster } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useMangas } from "@/hooks/useMangas";

export function AddMangaButton() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const [status, setStatus] = useState<string>("PretendoLer");
  const {mutateData} = useMangas(session?.user?.id, 1, 10, status);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session || !session.user) {
      toast.error("Sessão não encontrada. Por favor, faça login.");
      return;
    }
    const form = event.target as HTMLFormElement;

    try {
      const res = await fetch("/api/manga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: (form.elements.namedItem("name") as HTMLInputElement)?.value,
          secondName: (form.elements.namedItem("secondName") as HTMLInputElement)?.value,
          image: (form.elements.namedItem("image") as HTMLInputElement)?.value,
          chapter: (form.elements.namedItem("chapter") as HTMLInputElement)?.value,
          website: (form.elements.namedItem("website") as HTMLInputElement)?.value,
          linkToWebsite: (form.elements.namedItem("linkToWebsite") as HTMLInputElement)?.value,
          status: status,
          userId: session.user.id,
        }),
      });
  
      if (!res.ok) {
        toast.error("Erro ao adicionar manga!");
        return;
      }
  
      // Revalida os dados da lista de mangás
      await mutateData();
      toast.success("Manga adicionada com sucesso!");
    } catch (e) {
      toast.error("Erro ao adicionar manga!" + e);
    }
    setOpen(false);
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Toaster richColors closeButton />
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
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 py-4 background-color-[#122A3D]"
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" className="col-span-3" placeholder="Manga name" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="secondName" className="text-right">
              Nome Alternativo
            </Label>
            <Input id="secondName" className="col-span-3" placeholder="Alternative Name" />
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
          <div className="grid grid-cols-1 items-center gap-2 px-3">

          <RadioGroup defaultValue="option-one" onValueChange={(value) => setStatus(value)}>
            <div className="flex items-center justify-center space-x-2">
              <RadioGroupItem value="PretendoLer" id="option-one" className="bg-white text-black hover:bg-gray-400 border-white" />
              <Label htmlFor="option-one">Pretendo Ler</Label>
              <RadioGroupItem value="Lendo" id="option-two" className="bg-white text-black hover:bg-gray-400 border-white"/>
              <Label htmlFor="option-two">Lendo</Label>
              <RadioGroupItem value="Dropado" id="option-tree" className="bg-white text-black hover:bg-gray-400 border-white"/>
              <Label htmlFor="option-tree">Dropado</Label>
            </div>

          </RadioGroup>
          </div>
          <Button type="submit" className="ml-auto bg-white text-black hover:bg-gray-400" >
            Add Manga
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
