import useSWR from 'swr';

// Função fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Erro ao buscar dados');
  }
  return res.json(); // Certifique-se de que isso retorna o que você espera
};

// Hook personalizado para buscar mangás
export function useMangas(userId: string | null) {
  const { data, error, isLoading } = useSWR(
    userId ? `/api/manga?userId=${userId}` : null, // Somente busca se userId existir
    fetcher
  );
  return {
    mangas: data ?? [], // Evita undefined e retorna um array vazio como fallback
    isLoading,
    isError: !!error,
  };
}