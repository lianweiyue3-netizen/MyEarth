import { useEffect, useId, useMemo, useState } from "react";
import { announceStatus } from "../accessibility/liveRegion";
import type { SearchResult } from "../shared/domain";
import type { SearchService } from "../search/searchService";
import styles from "./SearchControl.module.css";

export function SearchControl({
  service,
  onSelectResult,
  disabled = false
}: {
  service: SearchService;
  onSelectResult: (result: SearchResult) => void;
  disabled?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedLabel, setSelectedLabel] = useState("");
  const inputId = useId();
  const listboxId = useId();
  const enabled = service.isEnabled() && !disabled;
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!trimmedQuery || !enabled) {
      setResults([]);
      setStatus(enabled ? "" : "Search needs VITE_CESIUM_ION_TOKEN.");
      return;
    }

    if (trimmedQuery === selectedLabel) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setStatus("Searching");
      service
        .search(trimmedQuery, controller.signal)
        .then((next) => {
          setResults(next);
          setActiveIndex(0);
          const message = next.length
            ? `${next.length} search results available.`
            : "No search results found.";
          setStatus(message);
          announceStatus(message);
        })
        .catch(() => {
          setResults([]);
          setStatus("Search failed. Try another place name.");
          announceStatus("Search failed. Try another place name.");
        });
    }, 260);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, selectedLabel, service, trimmedQuery]);

  const activeResult = useMemo(
    () => results[Math.min(activeIndex, Math.max(0, results.length - 1))],
    [activeIndex, results]
  );

  const selectResult = (result: SearchResult) => {
    onSelectResult(result);
    setSelectedLabel(result.label);
    setQuery(result.label);
    setResults([]);
    setStatus(`Selected ${result.label}.`);
    announceStatus(`Selected ${result.label}.`);
  };

  return (
    <div className={styles.search}>
      <div className={styles.header}>
        <div>
          <h2>Search</h2>
          <p>Find a place</p>
        </div>
      </div>
      <label htmlFor={inputId}>Search Earth</label>
      <input
        id={inputId}
        className={styles.input}
        value={query}
        disabled={!enabled}
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={
          activeResult ? `${listboxId}-${activeResult.id}` : undefined
        }
        placeholder={enabled ? "Search a place" : "Set Cesium token for search"}
        onChange={(event) => {
          setSelectedLabel("");
          setQuery(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) => Math.min(results.length - 1, current + 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) => Math.max(0, current - 1));
          } else if (event.key === "Enter" && activeResult) {
            event.preventDefault();
            selectResult(activeResult);
          } else if (event.key === "Escape") {
            setResults([]);
          }
        }}
      />
      <p className={styles.status} role="status">
        {status}
      </p>
      {results.length ? (
        <div id={listboxId} role="listbox" className={styles.listbox}>
          {results.map((result, index) => (
            <button
              key={result.id}
              id={`${listboxId}-${result.id}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={`${styles.option} ${
                index === activeIndex ? styles.active : ""
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => selectResult(result)}
            >
              {result.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
