// api.ts
import { useQuery } from '@tanstack/react-query';
import { Suggestion } from '../types/formular';

export const fetchSuggestions = async (query: string): Promise<Suggestion[]> => {
  const response = await fetch(`https://652f91320b8d8ddac0b2b62b.mockapi.io/autocomplete?search=${query}`);
  if (!response.ok) {
    throw new Error('Failed to fetch suggestions');
  }
  return response.json();
};

export const useSuggestions = (query: string) => {
  return useQuery<Suggestion[], Error>({
    queryKey: ['suggestions', query],
    queryFn: () => fetchSuggestions(query),
    enabled: query.length > 0,
    staleTime: 60000,
  });
};