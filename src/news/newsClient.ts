import {
  getPublicNewsUnavailableMessage,
  isNewsApiResponse,
  type NewsApiResponse,
  type NewsUnavailableReason
} from "./newsTypes.js";

const NEWS_ENDPOINT = "/api/news";

export type NewsClient = {
  loadSnapshot(signal?: AbortSignal): Promise<NewsApiResponse>;
};

export function createNewsClient(fetcher?: typeof fetch): NewsClient {
  const effectiveFetcher = fetcher ?? globalThis.fetch;

  return {
    async loadSnapshot(signal?: AbortSignal) {
      if (typeof effectiveFetcher !== "function") {
        return unavailable("provider-failed");
      }

      let response: Response;

      try {
        response = await effectiveFetcher(NEWS_ENDPOINT, {
          headers: { Accept: "application/json" },
          signal
        });
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }

        return unavailable("provider-failed");
      }

      if (!response.ok) {
        return unavailable("provider-failed");
      }

      try {
        const payload: unknown = await response.json();
        return isNewsApiResponse(payload)
          ? payload
          : unavailable("provider-failed");
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }

        return unavailable("provider-failed");
      }
    }
  };
}

function unavailable(reason: NewsUnavailableReason): NewsApiResponse {
  return {
    status: "unavailable",
    reason,
    message: getPublicNewsUnavailableMessage(reason)
  };
}

function isAbortError(error: unknown): boolean {
  return (
    typeof DOMException !== "undefined" && error instanceof DOMException
      ? error.name === "AbortError"
      : isAbortLikeRecord(error)
  );
}

function isAbortLikeRecord(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}
