import useSWR from "swr";

// Função fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Erro ao buscar dados");
  }
  return res.json(); // Certifique-se de que isso retorna o que você espera
};

// Hook personalizado para buscar mangás
export function useMangas(
  userId: string | undefined,
  page: number,
  limit: number,
  status?: string,
  name?: string
) {
  const { data, error, isLoading } = useSWR(
    userId
      ? `/api/manga?userId=${userId}&page=${page}&limit=${limit}&status=${status}${
          name ? `&name=${encodeURIComponent(name)}` : ""
        }` // Adiciona `name` como parâmetro, se fornecido
      : null,
    fetcher
  );
  return {
    mangas: data?.mangas ?? [], // Evita undefined e retorna um array vazio como fallback
    pagination: data?.pagination ?? { page: 1, totalPages: 1, totalItems: 0 }, // Evita undefined
    isLoading,
    isError: !!error,
  };
}
