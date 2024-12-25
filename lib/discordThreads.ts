// services/discordThreads.ts
import { DISCORD_API_BASE_URL, HEADERS } from "../config/discord";

/**
 * Cria uma thread privada no canal especificado.
 * @param channelId ID do canal onde a thread será criada.
 * @param threadName Nome da thread.
 * @returns ID da thread criada ou null em caso de erro.
 */
export async function createPrivateThread(channelId: string, threadName: string): Promise<string | null> {
  const url = `${DISCORD_API_BASE_URL}/channels/${channelId}/threads`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        name: threadName,
        type: 12, // Thread privada
        invitable: false,
        auto_archive_duration: 1440, // Expiração em minutos (24 horas)
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erro ao criar thread privada:", error);
      return null;
    }

    const threadData = await response.json();
    console.log(`Thread criada: ${threadData.id}`);
    return threadData.id;
  } catch (error) {
    console.error("Erro na criação da thread privada:", error);
    return null;
  }
}

/**
 * Adiciona um usuário a uma thread privada.
 * @param threadId ID da thread.
 * @param userDiscordId Discord ID do usuário.
 * @returns Boolean indicando sucesso ou falha.
 */
export async function addUserToThread(threadId: string, userDiscordId: string): Promise<boolean> {
  const url = `${DISCORD_API_BASE_URL}/channels/${threadId}/thread-members/${userDiscordId}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: HEADERS,
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erro ao adicionar usuário à thread:", error);
      return false;
    }

    console.log(`Usuário ${userDiscordId} adicionado à thread ${threadId}`);
    return true;
  } catch (error) {
    console.error("Erro ao adicionar usuário à thread:", error);
    return false;
  }
}

/**
 * Envia uma mensagem para uma thread privada.
 * @param threadId ID da thread.
 * @param message Conteúdo da mensagem.
 * @returns Boolean indicando sucesso ou falha.
 */
export async function sendMessageToThread(threadId: string, message: string): Promise<boolean> {
  const url = `${DISCORD_API_BASE_URL}/channels/${threadId}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ content: message }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erro ao enviar mensagem:", error);
      return false;
    }

    console.log(`Mensagem enviada na thread ${threadId}`);
    return true;
  } catch (error) {
    console.error("Erro ao enviar mensagem à thread:", error);
    return false;
  }
}
