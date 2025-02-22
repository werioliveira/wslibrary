import { createPrivateThread, addUserToThread, sendMessageToThread } from "./discordThreads";

/**
 * Notifica um usuário sobre um novo capítulo em uma thread privada no Discord.
 * @param channelId ID do canal pai.
 * @param userDiscordId Discord ID do usuário.
 * @param mangaName Nome do mangá.
 * @param newChapter Capítulo novo.
 * @param link Link para o capítulo.
 * @param image URL da capa do mangá.
 */
export async function notifyUserAboutNewChapter(
  channelId: string,
  userDiscordId: string,
  mangaName: string,
  newChapter: number,
  link: string,
  image: string
) {
  const threadName = `${mangaName}`;
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

  const embed = {
    title: `Novo capítulo de ${mangaName}!`,
    description: `**Capítulo:** ${newChapter}\n[Leia agora](${link})`,
    color: 0x00A2E8, // Cor azul (pode ser alterada)
    image: { url: image }, // Adiciona a capa do mangá
    footer: { text: "Receba notificações automáticas de novos capítulos!" }
  };

  // Converte a mensagem e a embed para JSON string
  const payload = JSON.stringify({ content: message, embeds: [embed] });

  const sent = await sendMessageToThread(threadId, payload);

  if (!sent) {
    console.error(`Falha ao enviar mensagem na thread ${threadId}`);
  }
}
