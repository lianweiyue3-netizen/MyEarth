import {
  createGNewsProvider,
  type GNewsProvider
} from "../../src/news/gnewsProvider.js";
import {
  createVercelKvNewsCache,
  type NewsCacheRepository
} from "../../src/news/newsCache.js";
import {
  listNewsCountries,
  type NewsCountryDefinition
} from "../../src/news/newsCountries.js";
import {
  refreshNewsSnapshot,
  type NewsRefreshResult
} from "../../src/news/newsRefreshService.js";
import {
  NEWS_UNAVAILABLE_MESSAGES,
  type NewsUnavailableReason
} from "../../src/news/newsTypes.js";

export type NewsRefreshServerEnv = Record<string, string | undefined>;

export type RefreshApiRequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
  url?: string;
};

export type RefreshApiResponseLike = {
  status(code: number): RefreshApiResponseLike;
  setHeader?(name: string, value: string): void;
  json(body: unknown): void;
};

export type NewsRefreshApiHandlerOptions = {
  cache?: NewsCacheRepository;
  countries?: readonly NewsCountryDefinition[];
  env?: NewsRefreshServerEnv;
  fetcher?: typeof fetch;
  now?: () => Date;
  provider?: GNewsProvider;
  requestDelayMs?: number;
};

export async function getRefreshNewsApiResponse(
  options: NewsRefreshApiHandlerOptions = {}
): Promise<NewsRefreshResult> {
  const env = options.env ?? process.env;
  const apiKey = env.GNEWS_API_KEY?.trim();
  const cache = options.cache ?? createNewsCacheFromEnv(env, options.fetcher);

  if (!apiKey) {
    return failed("missing-api-key");
  }

  if (!cache) {
    return failed("cache-empty", "News cache is not configured.");
  }

  const provider =
    options.provider ??
    createGNewsProvider({
      apiKey,
      fetcher: options.fetcher
    });

  return refreshNewsSnapshot({
    provider,
    cache,
    countries: options.countries ?? listNewsCountries(),
    now: options.now ?? (() => new Date()),
    requestDelayMs: options.requestDelayMs ?? readRefreshDelayMs(env)
  });
}

export async function refreshNewsApi(
  env: NewsRefreshServerEnv,
  fetcher?: typeof fetch
): Promise<NewsRefreshResult> {
  return getRefreshNewsApiResponse({ env, fetcher });
}

export async function handleNewsRefreshApiRequest(
  req: RefreshApiRequestLike,
  res: RefreshApiResponseLike,
  options: NewsRefreshApiHandlerOptions = {}
): Promise<void> {
  if (req.method && req.method !== "GET") {
    res.setHeader?.("Allow", "GET");
    res.status(405).json(failed("provider-failed", "Method not allowed."));
    return;
  }

  const env = options.env ?? process.env;

  if (!isRefreshSecretValid(req, env)) {
    res.status(401).json(failed("provider-failed", "Unauthorized refresh request."));
    return;
  }

  const result = await getRefreshNewsApiResponse(options);
  res.status(result.status === "failed" ? 503 : 200).json(result);
}

export default async function refreshHandler(
  req: RefreshApiRequestLike,
  res: RefreshApiResponseLike
): Promise<void> {
  await handleNewsRefreshApiRequest(req, res);
}

function createNewsCacheFromEnv(
  env: NewsRefreshServerEnv,
  fetcher?: typeof fetch
): NewsCacheRepository | undefined {
  const url = env.KV_REST_API_URL?.trim();
  const token = env.KV_REST_API_TOKEN?.trim();

  if (!url || !token) {
    return undefined;
  }

  return createVercelKvNewsCache({ url, token, fetcher });
}

function readRefreshDelayMs(env: NewsRefreshServerEnv): number {
  const configuredDelayMs = Number(env.GNEWS_REFRESH_DELAY_MS);
  if (Number.isFinite(configuredDelayMs) && configuredDelayMs >= 0) {
    return configuredDelayMs;
  }

  return 1_200;
}

function isRefreshSecretValid(
  req: RefreshApiRequestLike,
  env: NewsRefreshServerEnv
): boolean {
  const expectedSecret = env.NEWS_REFRESH_SECRET?.trim();

  if (!expectedSecret) {
    return true;
  }

  return readRequestSecret(req) === expectedSecret;
}

function readRequestSecret(req: RefreshApiRequestLike): string | undefined {
  const headerSecret = readHeader(req, "x-news-refresh-secret");
  const authorization = readHeader(req, "authorization");
  const bearerSecret = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
  const querySecret = readQuery(req, "secret");

  return headerSecret ?? bearerSecret ?? querySecret ?? readUrlSecret(req.url);
}

function readHeader(req: RefreshApiRequestLike, name: string): string | undefined {
  const headers = req.headers ?? {};
  const value = headers[name] ?? headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function readQuery(req: RefreshApiRequestLike, name: string): string | undefined {
  const value = req.query?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function readUrlSecret(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url, "https://myearth.local").searchParams.get("secret") ?? undefined;
  } catch {
    return undefined;
  }
}

function failed(
  reason: NewsUnavailableReason,
  message = NEWS_UNAVAILABLE_MESSAGES[reason]
): NewsRefreshResult {
  return {
    status: "failed",
    reason,
    message
  };
}
