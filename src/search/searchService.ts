import type { SearchResult } from "../shared/domain";

export type SearchAdapter = {
  search(query: string, signal?: AbortSignal): Promise<SearchResult[]>;
};

export type SearchService = {
  search(query: string, signal?: AbortSignal): Promise<SearchResult[]>;
  isEnabled(): boolean;
};

export function createSearchService(
  adapter: SearchAdapter | undefined,
  enabled: boolean
): SearchService {
  let sequence = 0;

  return {
    isEnabled() {
      return enabled && Boolean(adapter);
    },
    async search(query, signal) {
      const trimmed = query.trim();
      if (!trimmed || !adapter || !enabled) {
        return [];
      }

      const requestId = ++sequence;
      const results = await adapter.search(trimmed, signal);
      return requestId === sequence ? results : [];
    }
  };
}
