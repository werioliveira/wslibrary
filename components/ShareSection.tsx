import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ShareSection({
  manga,
  setManga,
}: {
  manga: any;
  setManga: Dispatch<SetStateAction<any>>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/read/${manga.shareId}`);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000); // volta pra "Copiar" depois de 2 segundos
  };

  return (
    <>
      {!manga?.shareId ? (
        <Button className="mt-2"
          onClick={async () => {
            const res = await fetch(`/api/manga/${manga.id}/share`, {
              method: "PATCH",
            });

            if (res.ok) {
              const updated = await res.json();
              setManga((prev: any) => (prev ? { ...prev, shareId: updated.shareId } : null));
            } else {
              console.error("Erro ao gerar o link de compartilhamento");
            }
          }}
        >
          Compartilhar Mangá
        </Button>
      ) : (
        <div className="mt-4">
          <span className="text-sm text-gray-600">Link de compartilhamento:</span>
          <div className="flex items-center gap-2 mt-1">
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {`${window.location.origin}/read/${manga.shareId}`}
            </code>
            <Button
              size="sm"
              variant={copied ? "default" : "outline"}
              onClick={handleCopy}
            >
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
