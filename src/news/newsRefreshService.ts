import type { NewsCacheRepository, NewsRefreshMetadata } from "./newsCache.js";
import type { GNewsProvider } from "./gnewsProvider.js";
import type { NewsCountryDefinition } from "./newsCountries.js";
import type {
  NewsCountrySummary,
  NewsSnapshot,
  NewsUnavailableReason
} from "./newsTypes.js";
import {
  getNewsUnavailableReason,
  NEWS_SNAPSHOT_SCHEMA_VERSION,
  NEWS_UNAVAILABLE_MESSAGES
} from "./newsTypes.js";
import {
  createNewsSnapshot,
  normalizeGNewsCountryResponse
} from "./newsNormalizer.js";

export type NewsRefreshResult =
  | { status: "refreshed"; snapshot: NewsSnapshot; countryCount: number }
  | { status: "skipped"; reason: "locked" | "fresh-cache" }
  | { status: "failed"; reason: NewsUnavailableReason; message: string };

export async function refreshNewsSnapshot(options: {
  provider: GNewsProvider;
  cache: NewsCacheRepository;
  countries: readonly NewsCountryDefinition[];
  now: () => Date;
  requestDelayMs?: number;
}): Promise<NewsRefreshResult> {
  const nowIso = options.now().toISOString();
  const requestDelayMs = Math.max(0, options.requestDelayMs ?? 0);
  let existingSuccessAt: string | undefined;

  try {
    const existing = await options.cache.getSnapshot();
    existingSuccessAt = existing?.refreshedAt;

    if (
      existing &&
      isSameUtcDate(existing.refreshedAt, nowIso) &&
      existing.snapshot.schemaVersion === NEWS_SNAPSHOT_SCHEMA_VERSION
    ) {
      return { status: "skipped", reason: "fresh-cache" };
    }
  } catch {
    existingSuccessAt = undefined;
  }

  let lockAcquired = false;

  try {
    lockAcquired = await options.cache.acquireRefreshLock(nowIso);
  } catch {
    return failed("cache-empty", "News cache is not available.");
  }

  if (!lockAcquired) {
    return { status: "skipped", reason: "locked" };
  }

  try {
    await setMetadataSafely(options.cache, {
      status: "refreshing",
      lastAttemptAt: nowIso,
      ...(existingSuccessAt ? { lastSuccessAt: existingSuccessAt } : {})
    });

    const countrySummaries: NewsCountrySummary[] = [];
    let lastFailureReason: NewsUnavailableReason | undefined;

    let countryIndex = 0;
    for (const country of options.countries) {
      try {
        const payload = await options.provider.fetchTopHeadlines({
          countryCode: country.code,
          category: "general",
          language: "en",
          max: 10
        });

        countrySummaries.push(
          normalizeGNewsCountryResponse({
            countryCode: country.code,
            countryName: country.name,
            payload,
            nowIso
          })
        );
      } catch (error) {
        const reason = getNewsUnavailableReason(error);
        lastFailureReason = reason;

        if (
          reason === "quota-exceeded" ||
          reason === "rate-limited" ||
          reason === "missing-api-key"
        ) {
          await markFailed(options.cache, nowIso, reason, existingSuccessAt);
          return failed(reason);
        }
      }

      if (requestDelayMs > 0 && countryIndex < options.countries.length - 1) {
        await delay(requestDelayMs);
      }
      countryIndex += 1;
    }

    if (countrySummaries.length === 0) {
      const reason = lastFailureReason ?? "provider-failed";
      await markFailed(options.cache, nowIso, reason, existingSuccessAt);
      return failed(reason);
    }

    const snapshot = createNewsSnapshot({
      countries: countrySummaries,
      lastUpdated: nowIso
    });

    await options.cache.setSnapshot({ snapshot, refreshedAt: nowIso });
    await setMetadataSafely(options.cache, {
      status: "idle",
      lastAttemptAt: nowIso,
      lastSuccessAt: nowIso
    });

    return {
      status: "refreshed",
      snapshot,
      countryCount: countrySummaries.length
    };
  } catch (error) {
    const reason = getNewsUnavailableReason(error, "provider-failed");
    await markFailed(options.cache, nowIso, reason, existingSuccessAt);
    return failed(reason);
  } finally {
    await options.cache.releaseRefreshLock().catch(() => undefined);
  }
}

async function markFailed(
  cache: NewsCacheRepository,
  nowIso: string,
  reason: NewsUnavailableReason,
  existingSuccessAt: string | undefined
): Promise<void> {
  await setMetadataSafely(cache, {
    status: "failed",
    lastAttemptAt: nowIso,
    ...(existingSuccessAt ? { lastSuccessAt: existingSuccessAt } : {}),
    lastFailureReason: reason
  });
}

async function setMetadataSafely(
  cache: NewsCacheRepository,
  metadata: NewsRefreshMetadata
): Promise<void> {
  await cache.setMetadata(metadata).catch(() => undefined);
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

function isSameUtcDate(leftIso: string, rightIso: string): boolean {
  return leftIso.slice(0, 10) === rightIso.slice(0, 10);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
