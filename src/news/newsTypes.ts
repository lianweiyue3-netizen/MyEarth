export type NewsProviderId = "GNews";
export const NEWS_SNAPSHOT_SCHEMA_VERSION = 3;
export type NewsLanguage = "en" | "ja";

export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  imageUrl?: string;
  sourceName: string;
  publishedAt: string;
};

export type NewsCountrySummary = {
  countryCode: string;
  countryName: string;
  language: NewsLanguage;
  headlineCount: number;
  articles: NewsArticle[];
};

export type NewsSnapshot = {
  schemaVersion?: typeof NEWS_SNAPSHOT_SCHEMA_VERSION;
  provider: NewsProviderId;
  category: "general";
  language: "mixed";
  lastUpdated: string;
  countries: Record<string, NewsCountrySummary>;
};

export type NewsUnavailableReason =
  | "missing-api-key"
  | "quota-exceeded"
  | "rate-limited"
  | "provider-failed"
  | "cache-empty"
  | "invalid-provider-payload";

export type NewsApiResponse =
  | {
      status: "ready";
      snapshot: NewsSnapshot;
      stale: boolean;
      message?: string;
    }
  | {
      status: "unavailable";
      reason: NewsUnavailableReason;
      message: string;
    };

export type NewsState =
  | { status: "idle" }
  | { status: "loading" }
  | {
      status: "ready";
      snapshot: NewsSnapshot;
      selectedCountryCode?: string;
      stale?: boolean;
      message?: string;
    }
  | { status: "unavailable"; reason: NewsUnavailableReason; message: string };

export const NEWS_UNAVAILABLE_MESSAGES: Record<NewsUnavailableReason, string> = {
  "missing-api-key": "News needs GNEWS_API_KEY on the server.",
  "quota-exceeded": "News is unavailable because the daily news quota was reached.",
  "rate-limited": "News is temporarily rate-limited by GNews. Try again shortly.",
  "provider-failed": "News is temporarily unavailable.",
  "cache-empty": "News has not loaded yet.",
  "invalid-provider-payload": "News is temporarily unavailable."
};

export const publicNewsUnavailableMessages = NEWS_UNAVAILABLE_MESSAGES;

export class NewsServiceError extends Error {
  readonly reason: NewsUnavailableReason;

  constructor(reason: NewsUnavailableReason, message = NEWS_UNAVAILABLE_MESSAGES[reason]) {
    super(message);
    this.name = "NewsServiceError";
    this.reason = reason;
  }
}

export function createNewsServiceError(
  reason: NewsUnavailableReason,
  message?: string
): NewsServiceError {
  return new NewsServiceError(reason, message);
}

export function getNewsUnavailableReason(
  error: unknown,
  fallback: NewsUnavailableReason = "provider-failed"
): NewsUnavailableReason {
  return error instanceof NewsServiceError ? error.reason : fallback;
}

export function getPublicNewsUnavailableMessage(
  reason: NewsUnavailableReason,
  fallback?: string
): string {
  return fallback?.trim() || NEWS_UNAVAILABLE_MESSAGES[reason];
}

export function isNewsApiResponse(value: unknown): value is NewsApiResponse {
  if (!isPlainRecord(value) || typeof value.status !== "string") {
    return false;
  }

  if (value.status === "ready") {
    return (
      isNewsSnapshot(value.snapshot) &&
      typeof value.stale === "boolean" &&
      (value.message === undefined || typeof value.message === "string")
    );
  }

  if (value.status === "unavailable") {
    return (
      isNewsUnavailableReason(value.reason) && typeof value.message === "string"
    );
  }

  return false;
}

export function isNewsState(value: unknown): value is NewsState {
  if (!isPlainRecord(value) || typeof value.status !== "string") {
    return false;
  }

  if (value.status === "idle" || value.status === "loading") {
    return true;
  }

  if (value.status === "ready") {
    return (
      isNewsSnapshot(value.snapshot) &&
      (value.selectedCountryCode === undefined ||
        (isCountryCode(value.selectedCountryCode) &&
          Boolean(value.snapshot.countries[value.selectedCountryCode]))) &&
      (value.stale === undefined || typeof value.stale === "boolean") &&
      (value.message === undefined || typeof value.message === "string")
    );
  }

  if (value.status === "unavailable") {
    return (
      isNewsUnavailableReason(value.reason) && typeof value.message === "string"
    );
  }

  return false;
}

export function isSerializableNewsState(value: unknown): value is NewsState {
  return isNewsState(value) && isSerializableNewsValue(value);
}

export function isNewsSnapshot(value: unknown): value is NewsSnapshot {
  if (!isPlainRecord(value)) {
    return false;
  }

  return (
    value.provider === "GNews" &&
    (value.schemaVersion === undefined ||
      value.schemaVersion === NEWS_SNAPSHOT_SCHEMA_VERSION) &&
    value.category === "general" &&
    value.language === "mixed" &&
    isIsoTimestamp(value.lastUpdated) &&
    isCountryRecord(value.countries)
  );
}

function isCountryRecord(value: unknown): value is Record<string, NewsCountrySummary> {
  if (!isPlainRecord(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([code, country]) =>
      isCountryCode(code) &&
      isNewsCountrySummary(country) &&
      country.countryCode === code
  );
}

function isNewsCountrySummary(value: unknown): value is NewsCountrySummary {
  if (!isPlainRecord(value)) {
    return false;
  }

  const headlineCount = value.headlineCount;

  return (
    isCountryCode(value.countryCode) &&
    typeof value.countryName === "string" &&
    value.countryName.trim().length > 0 &&
    isNewsLanguage(value.language) &&
    Number.isInteger(headlineCount) &&
    typeof headlineCount === "number" &&
    headlineCount >= 0 &&
    Array.isArray(value.articles) &&
    value.articles.length <= 10 &&
    value.articles.every(isNewsArticle)
  );
}

function isNewsArticle(value: unknown): value is NewsArticle {
  if (!isPlainRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    typeof value.summary === "string" &&
    isNonEmptyString(value.url) &&
    (value.imageUrl === undefined || isHttpUrl(value.imageUrl)) &&
    isNonEmptyString(value.sourceName) &&
    isIsoTimestamp(value.publishedAt)
  );
}

export function isNewsUnavailableReason(
  value: unknown
): value is NewsUnavailableReason {
  return (
    value === "missing-api-key" ||
    value === "quota-exceeded" ||
    value === "rate-limited" ||
    value === "provider-failed" ||
    value === "cache-empty" ||
    value === "invalid-provider-payload"
  );
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isHttpUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isNewsLanguage(value: unknown): value is NewsLanguage {
  return value === "en" || value === "ja";
}

export function isCountryCode(value: unknown): value is string {
  return typeof value === "string" && /^[a-z]{2}$/.test(value);
}

export function isIsoTimestamp(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    Number.isFinite(Date.parse(value))
  );
}

function isSerializableNewsValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isSerializableNewsValue);
  }

  if (!isPlainRecord(value)) {
    return false;
  }

  return Object.values(value).every(isSerializableNewsValue);
}
