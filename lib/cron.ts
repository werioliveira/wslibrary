
import {db} from "@/lib/db"; // Ajuste para o caminho do seu client Prisma
interface Manga {
    title: string;
    link: string;
    type?: string;
    chapter: number;
  }
// Função para buscar mangás do usuário e verificar capítulos
export default async function checkForUpdates(apiResults: Manga[] ) {
  try {
    // Buscar todos os mangás no banco de dados
    const userMangas = await db.manga.findMany();


    const notifications = [];

    // Comparar os mangás do usuário com os resultados da API
    for (const manga of userMangas) {
      const matchingManga = apiResults.find((item) =>
        [item.title.toLowerCase()].includes(manga.name.toLowerCase())
      );

      if (matchingManga && matchingManga?.chapter > manga.chapter) {
        notifications.push({
          userId: manga.userId,
          mangaName: manga.name,
          currentChapter: manga.chapter,
          newChapter: matchingManga.chapter,
          link: matchingManga.link,
        });

        // Atualizar o campo "hasNewChapter" no banco de dados
        await db.manga.update({
          where: { id: manga.id },
          data: { hasNewChapter: true },
        });
      }
    }

    // Notificar usuários (Exemplo de notificação)
    notifications.forEach((notification) => {
      console.log(`Notificação para usuário ${notification.userId}:`);
      console.log(
        `Novo capítulo do mangá "${notification.mangaName}"! Atual: ${notification.currentChapter}, Novo: ${notification.newChapter}.`
      );
      console.log(`Leia aqui: ${notification.link}`);
    });

  } catch (error) {
    console.error("Erro ao verificar atualizações:", error);
  }
}

// Agendar tarefa para rodar a cada hora (ajuste conforme necessário)
//cron.schedule("0 * * * *", checkForUpdates);
