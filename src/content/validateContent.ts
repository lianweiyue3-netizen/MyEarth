import type { CameraPreset, EarthLocation, LayerId } from "../shared/domain";
import { sourceNotesById } from "./sourceNotes";

const validLayerIds: LayerId[] = [
  "atmosphere",
  "terrain",
  "labels",
  "weatherRadar",
  "sound"
];

export function validateLocations(
  locations: EarthLocation[],
  presets: readonly Pick<CameraPreset, "id">[] = []
): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const presetIds = new Set(presets.map((preset) => preset.id));

  for (const location of locations) {
    if (ids.has(location.id)) {
      errors.push(`Duplicate location id: ${location.id}`);
    }
    ids.add(location.id);

    if (
      location.coordinates.latitude < -90 ||
      location.coordinates.latitude > 90 ||
      location.coordinates.longitude < -180 ||
      location.coordinates.longitude > 180
    ) {
      errors.push(`Invalid coordinates for ${location.id}`);
    }

    if (presets.length > 0 && !presetIds.has(location.cameraPresetId)) {
      errors.push(`Missing camera preset ${location.cameraPresetId}`);
    }

    for (const layerId of location.suggestedLayers) {
      if (!validLayerIds.includes(layerId)) {
        errors.push(`Invalid layer id ${layerId} for ${location.id}`);
      }
    }

    for (const sourceNoteId of location.sourceNoteIds) {
      if (!sourceNotesById[sourceNoteId]) {
        errors.push(`Missing source note ${sourceNoteId} for ${location.id}`);
      }
    }
  }

  return errors;
}
