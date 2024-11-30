import React from "react";

const MangaPageSkeleton = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-zinc-950 border-zinc-800 overflow-hidden animate-pulse">
        <div className="p-0 flex flex-col md:flex-row">
          {/* Imagem do Manga */}
          <div className="relative md:w-1/3 aspect-[3/4] bg-zinc-700">
            <div className="w-full h-full bg-zinc-600"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent"></div>
          </div>

          {/* Detalhes do Manga */}
          <div className="flex-1 p-6 bg-zinc-950">
            <div className="flex justify-between items-start mb-4">
              <div className="w-3/4 h-6 bg-zinc-600 rounded"></div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-zinc-600 rounded-full"></div>
              </div>
            </div>

            {/* Capítulo Atual e Controle */}
            <div className="py-2">
              <div className="text-lg font-semibold text-zinc-300 mb-2 w-3/4 h-4 bg-zinc-600 rounded"></div>
              <div className="flex items-center">
                <div className="w-20 h-10 bg-zinc-600 rounded"></div>
                <div className="flex flex-col gap-2 ml-4">
                  <div className="w-8 h-8 bg-zinc-600 rounded-full"></div>
                  <div className="w-8 h-8 bg-zinc-600 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Ações do Manga */}
            <div className="space-y-2 my-auto">
              <div className="w-full h-10 bg-zinc-600 rounded"></div>
              <div className="w-full h-10 bg-zinc-600 rounded"></div>
              <div className="w-full h-10 bg-red-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaPageSkeleton;
