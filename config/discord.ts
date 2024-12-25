// config/discord.ts
export const DISCORD_API_BASE_URL = "https://discord.com/api/v10";
export const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

export const HEADERS = {
  Authorization: `Bot ${BOT_TOKEN}`,
  "Content-Type": "application/json",
};
