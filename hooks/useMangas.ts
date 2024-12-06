import useSWR, { mutate } from "swr";

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
  page?: number,
  limit?: number | string,
  status?: string,
  name?: string
) {
  const endpoint = userId
    ? `/api/manga?userId=${userId}&page=${page}&limit=${limit}&status=${status}${
        name ? `&name=${encodeURIComponent(name)}` : ""
      }`
    : null;

  const { data, error, isLoading } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  return {
    mangas: data?.mangas ?? [],
    pagination: data?.pagination ?? { page: 1, totalPages: 1, totalItems: 0 },
    isLoading,
    isError: !!error,
    mutateData: () => mutate(endpoint), // Adiciona um atalho para revalidação
  };
}
