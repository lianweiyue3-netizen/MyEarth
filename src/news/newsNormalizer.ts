import type { NewsCountrySummary, NewsSnapshot } from "./newsTypes.js";
import {
  createNewsServiceError,
  isCountryCode,
  isIsoTimestamp
} from "./newsTypes.js";

const MAX_ARTICLES_PER_COUNTRY = 10;

export function normalizeGNewsCountryResponse(input: {
  countryCode: string;
  countryName: string;
  payload: unknown;
  nowIso: string;
}): NewsCountrySummary {
  const countryCode = input.countryCode.trim().toLowerCase();
  const countryName = input.countryName.trim();
  const nowIso = normalizeIsoTimestamp(input.nowIso);

  if (!isCountryCode(countryCode) || countryName.length === 0) {
    throw createNewsServiceError("invalid-provider-payload");
  }

  if (!isRecord(input.payload) || !Array.isArray(input.payload.articles)) {
    throw createNewsServiceError("invalid-provider-payload");
  }

  const articles = input.payload.articles
    .map((article, index) =>
      normalizeGNewsArticle({ article, countryCode, index, nowIso })
    )
    .filter((article): article is NonNullable<typeof article> => article !== undefined)
    .slice(0, MAX_ARTICLES_PER_COUNTRY);

  return {
    countryCode,
    countryName,
    headlineCount: articles.length,
    articles
  };
}

export function createNewsSnapshot(input: {
  countries: NewsCountrySummary[];
  lastUpdated: string;
}): NewsSnapshot {
  const lastUpdated = normalizeIsoTimestamp(input.lastUpdated);
  const countries: Record<string, NewsCountrySummary> = {};

  for (const country of input.countries) {
    if (!isCountryCode(country.countryCode) || country.countryName.trim().length === 0) {
      throw createNewsServiceError("invalid-provider-payload");
    }

    countries[country.countryCode] = {
      ...country,
      headlineCount: country.articles.length,
      articles: country.articles.slice(0, MAX_ARTICLES_PER_COUNTRY)
    };
  }

  return {
    provider: "GNews",
    category: "general",
    language: "en",
    lastUpdated,
    countries
  };
}

function normalizeGNewsArticle(input: {
  article: unknown;
  countryCode: string;
  index: number;
  nowIso: string;
}): NewsCountrySummary["articles"][number] | undefined {
  if (!isRecord(input.article)) {
    return undefined;
  }

  const title = readTrimmedString(input.article.title);
  const url = readSafeHttpUrl(input.article.url);

  if (!title || !url) {
    return undefined;
  }

  const summary =
    readTrimmedString(input.article.description) ??
    readTrimmedString(input.article.content) ??
    "";
  const sourceName =
    readSourceName(input.article.source) ?? readTrimmedString(input.article.source) ?? "GNews";
  const publishedAt =
    readIsoTimestamp(input.article.publishedAt) ??
    (input.article.publishedAt === undefined ? input.nowIso : undefined);

  if (!publishedAt) {
    return undefined;
  }

  return {
    id: createStableArticleId(input.countryCode, url || title, input.index),
    title,
    summary,
    url,
    sourceName,
    publishedAt
  };
}

function readSourceName(source: unknown): string | undefined {
  if (!isRecord(source)) {
    return undefined;
  }

  return readTrimmedString(source.name);
}

function readTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readSafeHttpUrl(value: unknown): string | undefined {
  const candidate = readTrimmedString(value);

  if (!candidate) {
    return undefined;
  }

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

function readIsoTimestamp(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  try {
    return normalizeIsoTimestamp(value);
  } catch {
    return undefined;
  }
}

function normalizeIsoTimestamp(value: string): string {
  const trimmed = value.trim();
  const parsed = Date.parse(trimmed);

  if (!Number.isFinite(parsed)) {
    throw createNewsServiceError("invalid-provider-payload");
  }

  const iso = new Date(parsed).toISOString();

  if (!isIsoTimestamp(iso)) {
    throw createNewsServiceError("invalid-provider-payload");
  }

  return iso;
}

function createStableArticleId(countryCode: string, key: string, index: number): string {
  let hash = 2166136261;
  const input = `${countryCode}|${key}|${index}`;

  for (let characterIndex = 0; characterIndex < input.length; characterIndex += 1) {
    hash ^= input.charCodeAt(characterIndex);
    hash = Math.imul(hash, 16777619);
  }

  return `${countryCode}-${index}-${(hash >>> 0).toString(36)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
