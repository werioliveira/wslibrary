// services/mangaNotification.ts
import { createPrivateThread, addUserToThread, sendMessageToThread } from "./discordThreads";

/**
 * Notifica um usuário sobre um novo capítulo em uma thread privada no Discord.
 * @param channelId ID do canal pai.
 * @param userDiscordId Discord ID do usuário.
 * @param mangaName Nome do mangá.
 * @param newChapter Capítulo novo.
 * @param link Link para o capítulo.
 */
export async function notifyUserAboutNewChapter(
  channelId: string,
  userDiscordId: string,
  mangaName: string,
  newChapter: number,
  link: string
) {
  const threadName = `New: ${mangaName}`;
  const threadId = await createPrivateThread(channelId, threadName);

  if (!threadId) {
    console.error("Falha ao criar thread para notificação.");
    return;
  }

  const added = await addUserToThread(threadId, userDiscordId);
  if (!added) {
    console.error(`Falha ao adicionar usuário ${userDiscordId} à thread ${threadId}`);
    return;
  }

  const message = `Olá! Um novo capítulo de **${mangaName}** está disponível!\n\n**Capítulo:** ${newChapter}\n[Leia agora](${link})`;
  const sent = await sendMessageToThread(threadId, message);

  if (!sent) {
    console.error(`Falha ao enviar mensagem na thread ${threadId}`);
  }
}
