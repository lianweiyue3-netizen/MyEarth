import {
  createNewsServiceError,
  NewsServiceError,
  type NewsUnavailableReason
} from "./newsTypes.js";

export type GNewsProviderOptions = {
  apiKey: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
};

export type GNewsCountryRequest = {
  countryCode: string;
  category: "general";
  language: "en";
  max: 10;
};

export type GNewsProvider = {
  fetchTopHeadlines(
    request: GNewsCountryRequest,
    signal?: AbortSignal
  ): Promise<unknown>;
};

const GNEWS_TOP_HEADLINES_URL = "https://gnews.io/api/v4/top-headlines";
const DEFAULT_TIMEOUT_MS = 8_000;

export function createGNewsProvider(options: GNewsProviderOptions): GNewsProvider {
  const apiKey = options.apiKey.trim();
  const fetcher = options.fetcher ?? globalThis.fetch.bind(globalThis);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    async fetchTopHeadlines(request, signal) {
      if (!apiKey) {
        throw createNewsServiceError("missing-api-key");
      }

      const controller = new AbortController();
      const timeoutId =
        timeoutMs > 0
          ? setTimeout(() => controller.abort(), timeoutMs)
          : undefined;
      const abortFromExternalSignal = () => controller.abort();

      if (signal?.aborted) {
        controller.abort();
      } else {
        signal?.addEventListener("abort", abortFromExternalSignal, { once: true });
      }

      try {
        const response = await fetcher(buildGNewsTopHeadlinesUrl(apiKey, request), {
          signal: controller.signal
        });

        if (!response.ok) {
          const errorPayload = await readJsonSafely(response);
          throw createNewsServiceError(
            mapStatusToReason(response.status, errorPayload)
          );
        }

        try {
          return await response.json();
        } catch {
          throw createNewsServiceError("invalid-provider-payload");
        }
      } catch (error) {
        if (error instanceof NewsServiceError) {
          throw error;
        }

        throw createNewsServiceError("provider-failed");
      } finally {
        if (timeoutId !== undefined) {
          clearTimeout(timeoutId);
        }

        signal?.removeEventListener("abort", abortFromExternalSignal);
      }
    }
  };
}

export function buildGNewsTopHeadlinesUrl(
  apiKey: string,
  request: GNewsCountryRequest
): string {
  const url = new URL(GNEWS_TOP_HEADLINES_URL);
  url.searchParams.set("country", request.countryCode);
  url.searchParams.set("category", request.category);
  url.searchParams.set("lang", request.language);
  url.searchParams.set("max", String(request.max));
  url.searchParams.set("apikey", apiKey);
  return url.toString();
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function mapStatusToReason(
  status: number,
  errorPayload: unknown
): NewsUnavailableReason {
  if (status === 429) {
    const errorText = extractErrorText(errorPayload).toLowerCase();
    if (
      errorText.includes("short period") ||
      errorText.includes("too many requests")
    ) {
      return "rate-limited";
    }

    return "quota-exceeded";
  }

  return "provider-failed";
}

function extractErrorText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(extractErrorText).join(" ");
  }

  if (!isPlainRecord(value)) {
    return "";
  }

  return Object.values(value).map(extractErrorText).join(" ");
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
