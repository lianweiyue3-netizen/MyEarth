import type { CSSProperties } from "react";
import type { LayerId } from "../shared/domain";
import type {
  NewsArticle,
  NewsCountrySummary,
  NewsState
} from "../news/newsTypes";
import styles from "./NewsPanel.module.css";

type StaggerStyle = CSSProperties & {
  "--item-delay": string;
};

export type NewsPanelProps = {
  state: NewsState;
  layerEnabled: boolean;
  disabled?: boolean;
  onLayerToggle: (visible: boolean) => void;
  onSelectCountry: (countryCode: string) => void;
  onClearCountry: () => void;
};

export function NewsPanel({
  state,
  layerEnabled,
  disabled = false,
  onLayerToggle,
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
        <button
          type="button"
          className={styles.toggle}
          disabled={disabled || state.status !== "ready" || headlineCountries.length === 0}
          aria-pressed={layerEnabled}
          onClick={() => onLayerToggle(!layerEnabled)}
        >
          {layerEnabled ? "Hide Map" : "Show Map"}
        </button>
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
              <a
                href={createYouTubeSearchUrl(article, country)}
                target="_blank"
                rel="noreferrer"
                className={styles.videoLink}
                aria-label={`Find related YouTube video: ${article.title}`}
              >
                Related video on YouTube
              </a>
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

function createYouTubeSearchUrl(
  article: NewsArticle,
  country: NewsCountrySummary
): string {
  const query = `${article.title} ${country.countryName} news`;
  const url = new URL("https://www.youtube.com/results");
  url.searchParams.set("search_query", query);
  return url.toString();
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

export const NEWS_LAYER_ID: LayerId = "newsHeatmap";
