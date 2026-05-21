import type { LayerId } from "../shared/domain";
import type { NewsCountrySummary, NewsState } from "../news/newsTypes";
import styles from "./NewsPanel.module.css";

export type NewsPanelProps = {
  state: NewsState;
  layerEnabled: boolean;
  disabled?: boolean;
  onLayerToggle: (visible: boolean) => void;
  onSelectCountry: (countryCode: string) => void;
};

export function NewsPanel({
  state,
  layerEnabled,
  disabled = false,
  onLayerToggle,
  onSelectCountry
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
      {renderBody(state, selectedCountry, headlineCountries, disabled, onSelectCountry)}
    </section>
  );
}

function renderBody(
  state: NewsState,
  selectedCountry: NewsCountrySummary | undefined,
  headlineCountries: NewsCountrySummary[],
  disabled: boolean,
  onSelectCountry: (countryCode: string) => void
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
        <CountryHeadlines country={selectedCountry} />
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
      {countries.map((country) => (
        <li key={country.countryCode}>
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

function CountryHeadlines({ country }: { country: NewsCountrySummary }) {
  return (
    <div className={styles.headlines}>
      <h3>{country.countryName}</h3>
      {country.articles.length === 0 ? (
        <p className={styles.status} role="status">
          No current headlines are available for this country.
        </p>
      ) : (
        <ol>
          {country.articles.slice(0, 10).map((article) => (
            <li key={article.id}>
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
            </li>
          ))}
        </ol>
      )}
    </div>
  );
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
