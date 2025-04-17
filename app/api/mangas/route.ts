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

        if (response instanceof Response) {
          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.mangas)) {
              return { success: true, endpoint, data };
            } else {
              return { success: false, endpoint, reason: 'resposta sem mangas' };
            }
          } else {
            return { success: false, endpoint, reason: `status ${response.status}` };
          }
        }

        return { success: false, endpoint, reason: 'resposta inválida' };
      } catch (err: any) {
        return { success: false, endpoint, reason: err?.message || 'erro desconhecido' };
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
    ];

    // Process all endpoints
    const responses = await Promise.all(endpoints.map(fetchWithTimeout));

    // Log de erros mais amigável
    const failed = responses.filter(r => !r.success);
    if (failed.length > 0) {
      console.log("⛔ Erros nos endpoints:");
      failed.forEach(f => {
        const nome = f.endpoint.split('/').pop();
        console.log(`- endpoint ${nome} retornou erro: ${f.reason}`);
      });
    }

    // Só pega os que funcionaram
    const results = responses
      .filter(r => r.success && r.data)
      .map(r => r.data);

    const allMangas = results.flatMap(result => result.mangas);
    const uniqueMangas = deduplicateMangas(allMangas);

    const MANGA_BATCH_SIZE = 50;
    const notifications = [];

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