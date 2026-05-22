import { cityLocations, wonderLocations } from "../content/locations";
import type { EarthLocation } from "../shared/domain";
import styles from "./LocationList.module.css";

export function LocationList({
  selectedLocationId,
  onSelectLocation,
  disabled = false
}: {
  selectedLocationId?: string;
  onSelectLocation: (location: EarthLocation) => void;
  disabled?: boolean;
}) {
  return (
    <section className={styles.list} aria-label="Location shortcuts">
      <div className={styles.header}>
        <div>
          <h2>Places</h2>
          <p>Wonders and cities</p>
        </div>
      </div>
      <LocationGroup
        title="Wonders"
        locations={wonderLocations}
        selectedLocationId={selectedLocationId}
        onSelectLocation={onSelectLocation}
        disabled={disabled}
      />
      <LocationGroup
        title="Cities"
        locations={cityLocations}
        selectedLocationId={selectedLocationId}
        onSelectLocation={onSelectLocation}
        disabled={disabled}
      />
    </section>
  );
}

function LocationGroup({
  title,
  locations,
  selectedLocationId,
  onSelectLocation,
  disabled
}: {
  title: string;
  locations: EarthLocation[];
  selectedLocationId?: string;
  onSelectLocation: (location: EarthLocation) => void;
  disabled: boolean;
}) {
  return (
    <div className={styles.group}>
      <h3>{title}</h3>
      <div className={styles.items}>
        {locations.map((location) => (
          <button
            key={location.id}
            type="button"
            disabled={disabled}
            className={`${styles.item} ${
              selectedLocationId === location.id ? styles.selected : ""
            }`}
            onClick={() => onSelectLocation(location)}
          >
            {location.name}
          </button>
        ))}
      </div>
    </div>
  );
}
