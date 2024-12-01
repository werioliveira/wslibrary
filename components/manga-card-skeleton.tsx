import { Card, CardContent } from "@/components/ui/card";

export function MangaCardSkeleton() {
  return (
    <>
    {[1, 2, 3, 4, 5, 6, 7, 8,9,10].map((i) => (
      <Card className="bg-zinc-950 rounded-xl overflow-hidden border-zinc-800 flex flex-col h-full" key={i}>
        <div className="relative pt-[133%] overflow-hidden bg-zinc-800">
          <div className="absolute inset-0 w-full h-full animate-pulse bg-zinc-700" />
        </div>
        <CardContent className="p-3 bg-zinc-950 flex-grow">
          <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 bg-zinc-800 rounded w-1/2 animate-pulse" />
            <div className="h-3 bg-zinc-800 rounded w-2/3 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    ))}
    </>
  );
}
