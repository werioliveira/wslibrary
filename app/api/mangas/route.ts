import { deduplicateMangas, processMangas } from "@/lib/fetchManga";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const TIMEOUT_MS = 10000;

    const timeoutPromise = (ms: number) => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), ms)
      );

    const fetchWithTimeout = async (endpoint: string) => {
      try {
        const response = await Promise.race([
          fetch(endpoint),
          timeoutPromise(TIMEOUT_MS)
        ]);
        
        if (response instanceof Response && response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.mangas)) {
            return data;
          }
        }
        return null;
      } catch (err) {
        console.log(`Erro ou timeout ao buscar ${endpoint}`);
        return null;
      }
    };

    const endpoints = [
      `${baseUrl}/api/mangas/seitacelestial`,
      `${baseUrl}/api/mangas/sussy`,
      `${baseUrl}/api/mangas/imperio`,
      `${baseUrl}/api/mangas/lermangas`,
      `${baseUrl}/api/mangas/slimer`,	
      `${baseUrl}/api/mangas/hteca`,
      `${baseUrl}/api/mangas/lunar`,
      `${baseUrl}/api/mangas/ego`,
      `${baseUrl}/api/mangas/yushuke`,
      `${baseUrl}/api/mangas/mangaLivre`,
      `${baseUrl}/api/mangas/remangas`,
      `${baseUrl}/api/mangas/manhastro`,
      `${baseUrl}/api/mangas/readMangas`,
      `${baseUrl}/api/mangas/yomu`,
      `${baseUrl}/api/mangas/mangaonline`,

      //`${baseUrl}/api/mangas/oldSussy`,
    ];

    // Process all endpoints simultaneously
    const results = (await Promise.all(
      endpoints.map(endpoint => fetchWithTimeout(endpoint))
    )).filter(result => result !== null);

    const allMangas = results.flatMap(result => result.mangas);
    const uniqueMangas = deduplicateMangas(allMangas);

    // Process mangas in smaller batches
    const MANGA_BATCH_SIZE = 50;
    let notifications = [];
    
    for (let i = 0; i < uniqueMangas.length; i += MANGA_BATCH_SIZE) {
      const mangaBatch = uniqueMangas.slice(i, i + MANGA_BATCH_SIZE);
        const batchNotifications = await processMangas(mangaBatch);
        notifications.push(...batchNotifications);
    }

    return NextResponse.json({ mangas: notifications }, { status: 200 });
  } catch (error) {
    console.error("Erro ao consolidar mangas:", error);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
