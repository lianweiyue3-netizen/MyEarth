import type { VisualModeDefinition, VisualModeId } from "../shared/domain";

export const visualModes: VisualModeDefinition[] = [
  {
    id: "satellite",
    label: "Satellite",
    description: "Natural imagery with balanced learning overlays.",
    defaultLayers: {
      clouds: true,
      atmosphere: true,
      terrain: true,
      labels: false,
      buildings: false,
      weatherRadar: false,
      aurora: false
    },
    imageryStrategy: "cesiumWorldImagery",
    terrainEmphasis: false,
    radarOpacity: 0.52
  },
  {
    id: "political",
    label: "Labels",
    description: "Reference labels and borders for orientation.",
    defaultLayers: {
      labels: true,
      atmosphere: true,
      terrain: true,
      clouds: false
    },
    imageryStrategy: "cesiumLabels",
    terrainEmphasis: false,
    radarOpacity: 0.45
  },
  {
    id: "nightLights",
    label: "Night",
    description: "NASA Black Marble night-lights emphasis.",
    defaultLayers: {
      labels: false,
      atmosphere: true,
      terrain: false,
      clouds: false,
      buildings: false
    },
    imageryStrategy: "blackMarble",
    terrainEmphasis: false,
    radarOpacity: 0.6
  },
  {
    id: "terrainEmphasis",
    label: "Terrain",
    description: "Relief-forward view for landforms and mountain systems.",
    defaultLayers: {
      terrain: true,
      labels: false,
      clouds: false,
      atmosphere: true
    },
    imageryStrategy: "terrainEmphasis",
    terrainEmphasis: true,
    radarOpacity: 0.48
  },
  {
    id: "cleanGlobe",
    label: "Clean",
    description: "Minimal view with nonessential overlays hidden.",
    defaultLayers: {
      clouds: false,
      labels: false,
      buildings: false,
      weatherRadar: false,
      aurora: false,
      atmosphere: true,
      terrain: true
    },
    imageryStrategy: "minimal",
    terrainEmphasis: false,
    radarOpacity: 0.5
  }
];

export const visualModesById = Object.fromEntries(
  visualModes.map((mode) => [mode.id, mode])
) as Record<VisualModeId, VisualModeDefinition>;

export function getVisualMode(id: VisualModeId): VisualModeDefinition {
  return visualModesById[id];
}
