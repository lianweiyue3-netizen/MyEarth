import {
  getPublicYouTubeVideoUnavailableMessage,
  type YouTubeVideoApiResponse,
  type YouTubeVideoSummary,
  type YouTubeVideoUnavailableReason
} from "../../src/news/youtubeVideo.js";

export type YouTubeVideoServerEnv = Record<string, string | undefined>;

export type VideoApiRequestLike = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

export type VideoApiResponseLike = {
  status(code: number): VideoApiResponseLike;
  setHeader?(name: string, value: string): void;
  json(body: unknown): void;
};

export type YouTubeVideoApiHandlerOptions = {
  env?: YouTubeVideoServerEnv;
  fetcher?: typeof fetch;
  query?: string;
};

const YOUTUBE_SEARCH_ENDPOINT = "https://www.googleapis.com/youtube/v3/search";

export async function getYouTubeVideoApiResponse(
  options: YouTubeVideoApiHandlerOptions = {}
): Promise<YouTubeVideoApiResponse> {
  const query = options.query?.trim();
  const apiKey = (options.env ?? process.env).YOUTUBE_API_KEY?.trim();
  const fetcher = options.fetcher ?? fetch;

  if (!query || query.length < 3) {
    return unavailable("invalid-query");
  }

  if (!apiKey) {
    return unavailable("missing-api-key");
  }

  const url = new URL(YOUTUBE_SEARCH_ENDPOINT);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("videoEmbeddable", "true");
  url.searchParams.set("safeSearch", "moderate");
  url.searchParams.set("relevanceLanguage", "en");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("q", query);
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetcher(url, {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      return unavailable("api-error");
    }

    const video = parseYouTubeSearchResponse(await readJsonSafely(response));
    return video ? { status: "ready", video } : unavailable("not-found");
  } catch {
    return unavailable("api-error");
  }
}

export async function handleYouTubeVideoApiRequest(
  req: VideoApiRequestLike,
  res: VideoApiResponseLike,
  options: YouTubeVideoApiHandlerOptions = {}
): Promise<void> {
  if (req.method && req.method !== "GET") {
    res.setHeader?.("Allow", "GET");
    res.status(405).json(unavailable("api-error", "Method not allowed."));
    return;
  }

  const query = options.query ?? readQuery(req, "query");
  const response = await getYouTubeVideoApiResponse({ ...options, query });
  res.status(200).json(response);
}

export default async function youtubeVideoHandler(
  req: VideoApiRequestLike,
  res: VideoApiResponseLike
): Promise<void> {
  await handleYouTubeVideoApiRequest(req, res);
}

function parseYouTubeSearchResponse(payload: unknown): YouTubeVideoSummary | undefined {
  if (!isRecord(payload) || !Array.isArray(payload.items)) {
    return undefined;
  }

  for (const item of payload.items) {
    const video = parseYouTubeSearchItem(item);
    if (video) {
      return video;
    }
  }

  return undefined;
}

function parseYouTubeSearchItem(item: unknown): YouTubeVideoSummary | undefined {
  if (!isRecord(item) || !isRecord(item.id) || !isRecord(item.snippet)) {
    return undefined;
  }

  const videoId = item.id.videoId;
  const title = item.snippet.title;
  const channelTitle = item.snippet.channelTitle;
  const thumbnailUrl = readThumbnailUrl(item.snippet.thumbnails);

  if (
    typeof videoId !== "string" ||
    typeof title !== "string" ||
    typeof channelTitle !== "string"
  ) {
    return undefined;
  }

  return {
    videoId,
    title,
    channelTitle,
    ...(thumbnailUrl ? { thumbnailUrl } : {})
  };
}

function readThumbnailUrl(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const medium = value.medium;
  const high = value.high;
  const fallback = value.default;

  for (const candidate of [medium, high, fallback]) {
    if (isRecord(candidate) && typeof candidate.url === "string") {
      return candidate.url;
    }
  }

  return undefined;
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function readQuery(req: VideoApiRequestLike, name: string): string | undefined {
  const value = req.query?.[name];
  return Array.isArray(value) ? value[0] : value;
}

function unavailable(
  reason: YouTubeVideoUnavailableReason,
  message = getPublicYouTubeVideoUnavailableMessage(reason)
): YouTubeVideoApiResponse {
  return {
    status: "unavailable",
    reason,
    message
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
