import { useState, type CSSProperties } from "react";
import type {
  NewsArticle,
  NewsCountrySummary,
  NewsState
} from "../news/newsTypes";
import {
  createYouTubeEmbedUrl,
  getPublicYouTubeVideoUnavailableMessage,
  isYouTubeVideoApiResponse,
  type YouTubeVideoApiResponse,
  type YouTubeVideoSummary
} from "../news/youtubeVideo";
import styles from "./NewsPanel.module.css";

type StaggerStyle = CSSProperties & {
  "--item-delay": string;
};

type ArticleVideoState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; video: YouTubeVideoSummary; visible: boolean }
  | { status: "unavailable"; message: string };

export type NewsPanelProps = {
  state: NewsState;
  disabled?: boolean;
  onSelectCountry: (countryCode: string) => void;
  onClearCountry: () => void;
};

export function NewsPanel({
  state,
  disabled = false,
  onSelectCountry,
  onClearCountry
}: NewsPanelProps) {
  const selectedCountry =
    state.status === "ready" && state.selectedCountryCode
      ? state.snapshot.countries[state.selectedCountryCode]
      : undefined;
  const headlineCountries =
    state.status === "ready"
      ? Object.values(state.snapshot.countries)
          .filter((country) => country.headlineCount > 0)
          .sort((left, right) => right.headlineCount - left.headlineCount)
      : [];

  return (
    <section
      id="news-panel"
      className={styles.panel}
      aria-label="World news"
      data-testid="news-panel"
    >
      <div className={styles.header}>
        <div>
          <h2>World News</h2>
          <p>General headlines by country</p>
        </div>
      </div>
      {renderBody(
        state,
        selectedCountry,
        headlineCountries,
        disabled,
        onSelectCountry,
        onClearCountry
      )}
    </section>
  );
}

function renderBody(
  state: NewsState,
  selectedCountry: NewsCountrySummary | undefined,
  headlineCountries: NewsCountrySummary[],
  disabled: boolean,
  onSelectCountry: (countryCode: string) => void,
  onClearCountry: () => void
) {
  if (state.status === "idle" || state.status === "loading") {
    return (
      <p className={styles.status} role="status">
        Loading country headlines.
      </p>
    );
  }

  if (state.status === "unavailable") {
    return (
      <p className={styles.status} role="status">
        {state.message}
      </p>
    );
  }

  return (
    <>
      <p className={styles.updated}>
        Last updated{" "}
        <time dateTime={state.snapshot.lastUpdated}>
          {formatDateTime(state.snapshot.lastUpdated)}
        </time>
      </p>
      {state.stale ? (
        <p className={styles.status} role="status">
          {state.message || "Showing the latest cached headlines."}
        </p>
      ) : null}
      {selectedCountry ? (
        <CountryHeadlines
          country={selectedCountry}
          disabled={disabled}
          onClearCountry={onClearCountry}
        />
      ) : (
        <CountryList
          countries={headlineCountries}
          disabled={disabled}
          onSelectCountry={onSelectCountry}
        />
      )}
    </>
  );
}

function CountryList({
  countries,
  disabled,
  onSelectCountry
}: {
  countries: NewsCountrySummary[];
  disabled: boolean;
  onSelectCountry: (countryCode: string) => void;
}) {
  if (countries.length === 0) {
    return (
      <p className={styles.status} role="status">
        No current headlines are available.
      </p>
    );
  }

  return (
    <ul className={styles.countryList} aria-label="Countries with headlines">
      {countries.map((country, index) => (
        <li
          key={country.countryCode}
          className={styles.staggerItem}
          style={getStaggerStyle(index)}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelectCountry(country.countryCode)}
          >
            <span>{country.countryName}</span>
            <strong>{country.headlineCount}</strong>
          </button>
        </li>
      ))}
    </ul>
  );
}

function CountryHeadlines({
  country,
  disabled,
  onClearCountry
}: {
  country: NewsCountrySummary;
  disabled: boolean;
  onClearCountry: () => void;
}) {
  return (
    <div className={styles.headlines}>
      <div className={styles.countryHeader}>
        <h3>{country.countryName}</h3>
        <button type="button" disabled={disabled} onClick={onClearCountry}>
          Back
        </button>
      </div>
      {country.articles.length === 0 ? (
        <p className={styles.status} role="status">
          No current headlines are available for this country.
        </p>
      ) : (
        <ol>
          {country.articles.slice(0, 10).map((article, index) => (
            <li
              key={article.id}
              className={styles.staggerItem}
              style={getStaggerStyle(index)}
            >
              {article.imageUrl ? (
                <img
                  src={article.imageUrl}
                  alt=""
                  className={styles.articleImage}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <a
                href={article.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Read article: ${article.title}`}
              >
                {article.title}
              </a>
              {article.summary ? <p>{article.summary}</p> : null}
              <span>
                {article.sourceName} - {formatDateTime(article.publishedAt)}
              </span>
              <ArticleVideoPlayer
                article={article}
                country={country}
                disabled={disabled}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function getStaggerStyle(index: number): StaggerStyle {
  return {
    "--item-delay": `${Math.min(index, 12) * 60}ms`
  };
}

function ArticleVideoPlayer({
  article,
  country,
  disabled
}: {
  article: NewsArticle;
  country: NewsCountrySummary;
  disabled: boolean;
}) {
  const [state, setState] = useState<ArticleVideoState>({ status: "idle" });
  const expanded = state.status === "ready" && state.visible;

  const handleVideoClick = async () => {
    if (state.status === "ready") {
      setState({ ...state, visible: !state.visible });
      return;
    }

    if (state.status === "loading") {
      return;
    }

    setState({ status: "loading" });
    const response = await loadRelatedYouTubeVideo(createYouTubeVideoQuery(article, country));

    if (response.status === "ready") {
      setState({ status: "ready", video: response.video, visible: true });
    } else {
      setState({ status: "unavailable", message: response.message });
    }
  };

  return (
    <div className={styles.video}>
      <button
        type="button"
        className={styles.videoButton}
        disabled={disabled || state.status === "loading"}
        aria-expanded={expanded}
        aria-controls={`youtube-player-${article.id}`}
        onClick={() => {
          void handleVideoClick();
        }}
      >
        {state.status === "loading"
          ? "Loading video"
          : expanded
            ? "Hide YouTube video"
            : "Show YouTube video"}
      </button>
      {state.status === "loading" ? (
        <p className={styles.videoStatus} role="status">
          Loading YouTube video.
        </p>
      ) : null}
      {state.status === "unavailable" ? (
        <p className={styles.videoStatus} role="status">
          {state.message}
        </p>
      ) : null}
      {state.status === "ready" && state.visible ? (
        <div className={styles.videoFrame} id={`youtube-player-${article.id}`}>
          <iframe
            title={`YouTube video: ${state.video.title}`}
            src={createYouTubeEmbedUrl(state.video.videoId)}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
          <p className={styles.videoMeta}>
            {state.video.title} - {state.video.channelTitle}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function createYouTubeVideoQuery(article: NewsArticle, country: NewsCountrySummary): string {
  return `${article.title} ${country.countryName} news`;
}

async function loadRelatedYouTubeVideo(
  query: string
): Promise<YouTubeVideoApiResponse> {
  const endpoint = new URL("/api/news/video", window.location.origin);
  endpoint.searchParams.set("query", query);

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      return unavailableVideo("api-error");
    }

    const payload: unknown = await response.json();
    return isYouTubeVideoApiResponse(payload)
      ? payload
      : unavailableVideo("api-error");
  } catch {
    return unavailableVideo("api-error");
  }
}

function unavailableVideo(
  reason: Parameters<typeof getPublicYouTubeVideoUnavailableMessage>[0]
): YouTubeVideoApiResponse {
  return {
    status: "unavailable",
    reason,
    message: getPublicYouTubeVideoUnavailableMessage(reason)
  };
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
}
