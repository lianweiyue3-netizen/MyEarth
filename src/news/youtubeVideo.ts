export type YouTubeVideoUnavailableReason =
  | "missing-api-key"
  | "invalid-query"
  | "not-found"
  | "api-error";

export type YouTubeVideoSummary = {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl?: string;
};

export type YouTubeVideoApiResponse =
  | { status: "ready"; video: YouTubeVideoSummary }
  | {
      status: "unavailable";
      reason: YouTubeVideoUnavailableReason;
      message: string;
    };

export const YOUTUBE_VIDEO_UNAVAILABLE_MESSAGES: Record<
  YouTubeVideoUnavailableReason,
  string
> = {
  "missing-api-key": "YouTube video lookup needs YOUTUBE_API_KEY on the server.",
  "invalid-query": "This story does not have enough information to find a video.",
  "not-found": "No embeddable YouTube video was found for this story.",
  "api-error": "YouTube video lookup is temporarily unavailable."
};

export function getPublicYouTubeVideoUnavailableMessage(
  reason: YouTubeVideoUnavailableReason
) {
  return YOUTUBE_VIDEO_UNAVAILABLE_MESSAGES[reason];
}

export function createYouTubeEmbedUrl(videoId: string): string {
  const safeVideoId = encodeURIComponent(videoId);
  const url = new URL(`https://www.youtube-nocookie.com/embed/${safeVideoId}`);
  url.searchParams.set("rel", "0");
  url.searchParams.set("modestbranding", "1");
  return url.toString();
}

export function isYouTubeVideoApiResponse(
  value: unknown
): value is YouTubeVideoApiResponse {
  if (!isRecord(value)) {
    return false;
  }

  if (value.status === "ready") {
    return isYouTubeVideoSummary(value.video);
  }

  return (
    value.status === "unavailable" &&
    isYouTubeVideoUnavailableReason(value.reason) &&
    typeof value.message === "string"
  );
}

function isYouTubeVideoSummary(value: unknown): value is YouTubeVideoSummary {
  return (
    isRecord(value) &&
    isNonEmptyString(value.videoId) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.channelTitle) &&
    (value.thumbnailUrl === undefined || isNonEmptyString(value.thumbnailUrl))
  );
}

function isYouTubeVideoUnavailableReason(
  value: unknown
): value is YouTubeVideoUnavailableReason {
  return (
    value === "missing-api-key" ||
    value === "invalid-query" ||
    value === "not-found" ||
    value === "api-error"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
