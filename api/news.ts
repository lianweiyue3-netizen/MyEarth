import {
  createVercelKvNewsCache,
  type NewsCacheRepository
} from "../src/news/newsCache.js";
import {
  NEWS_UNAVAILABLE_MESSAGES,
  type NewsApiResponse,
  type NewsUnavailableReason
} from "../src/news/newsTypes.js";

export type NewsServerEnv = Record<string, string | undefined>;

export type ApiRequestLike = {
  method?: string;
};

export type ApiResponseLike = {
  status(code: number): ApiResponseLike;
  setHeader?(name: string, value: string): void;
  json(body: unknown): void;
};

export type NewsApiHandlerOptions = {
  cache?: NewsCacheRepository;
  env?: NewsServerEnv;
  fetcher?: typeof fetch;
  now?: () => Date;
};

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

export async function getCachedNewsApiResponse(
  options: NewsApiHandlerOptions = {}
): Promise<NewsApiResponse> {
  const cache =
    options.cache ?? createNewsCacheFromEnv(options.env ?? process.env, options.fetcher);
  const now = options.now ?? (() => new Date());

  if (!cache) {
    return unavailable("cache-empty", "News cache is not configured.");
  }

  try {
    const record = await cache.getSnapshot();

    if (!record) {
      return unavailable("cache-empty");
    }

    return {
      status: "ready",
      snapshot: record.snapshot,
      stale: isSnapshotStale(record.snapshot.lastUpdated, now())
    };
  } catch {
    return unavailable("cache-empty");
  }
}

export async function getNewsApiResponse(
  env: NewsServerEnv,
  now: () => Date,
  fetcher?: typeof fetch
): Promise<NewsApiResponse> {
  const cache = createNewsCacheFromEnv(env, fetcher);

  if (!cache) {
    return unavailable("cache-empty");
  }

  return getCachedNewsApiResponse({ cache, now });
}

export async function handleNewsApiRequest(
  req: ApiRequestLike,
  res: ApiResponseLike,
  options: NewsApiHandlerOptions = {}
): Promise<void> {
  if (req.method && req.method !== "GET") {
    res.setHeader?.("Allow", "GET");
    res.status(405).json(unavailable("provider-failed", "Method not allowed."));
    return;
  }

  const response = await getCachedNewsApiResponse(options);
  res.status(200).json(response);
}

export default async function newsHandler(
  req: ApiRequestLike,
  res: ApiResponseLike
): Promise<void> {
  await handleNewsApiRequest(req, res);
}

function createNewsCacheFromEnv(
  env: NewsServerEnv,
  fetcher?: typeof fetch
): NewsCacheRepository | undefined {
  const url = env.KV_REST_API_URL?.trim();
  const token = env.KV_REST_API_TOKEN?.trim();

  if (!url || !token) {
    return undefined;
  }

  return createVercelKvNewsCache({ url, token, fetcher });
}

function isSnapshotStale(lastUpdated: string, now: Date): boolean {
  const lastUpdatedMs = Date.parse(lastUpdated);

  if (!Number.isFinite(lastUpdatedMs)) {
    return true;
  }

  return now.getTime() - lastUpdatedMs > STALE_AFTER_MS;
}

function unavailable(
  reason: NewsUnavailableReason,
  message = NEWS_UNAVAILABLE_MESSAGES[reason]
): NewsApiResponse {
  return {
    status: "unavailable",
    reason,
    message
  };
}
