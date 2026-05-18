import type { EarthLocation } from "../shared/domain";

const wonderSource = (id: string, ...topicIds: string[]) => [
  `location-${id}`,
  ...topicIds
];

export const wonderLocations: EarthLocation[] = [
  {
    id: "mount-everest",
    name: "Mount Everest",
    kind: "wonder",
    category: "Highest mountain",
    coordinates: { latitude: 27.9881, longitude: 86.925, heightMeters: 8849 },
    cameraPresetId: "mount-everest",
    summary:
      "The summit of Everest rises where the Indian Plate continues to press into Eurasia, lifting the Himalayas over geologic time.",
    facts: [
      "Everest is part of the Himalayan range formed by continental collision.",
      "The summit sits in a harsh alpine climate with low oxygen and extreme winds.",
      "Glaciers around Everest feed major Asian river systems."
    ],
    topics: ["terrain", "geology", "ice"],
    suggestedLayers: ["terrain", "clouds"],
    sourceNoteIds: wonderSource("mount-everest", "topic-terrain", "topic-ice"),
    buildingDescentPreferred: false
  },
  {
    id: "grand-canyon",
    name: "Grand Canyon",
    kind: "wonder",
    category: "River-carved canyon",
    coordinates: { latitude: 36.1069, longitude: -112.1129 },
    cameraPresetId: "grand-canyon",
    summary:
      "The Grand Canyon exposes layered rock and the long erosive work of the Colorado River across the Colorado Plateau.",
    facts: [
      "Visible rock layers record hundreds of millions of years of Earth history.",
      "River incision and plateau uplift shaped the canyon's dramatic relief.",
      "Desert ecosystems vary sharply between rim, slope, and river corridor."
    ],
    topics: ["terrain", "geology", "water"],
    suggestedLayers: ["terrain"],
    sourceNoteIds: wonderSource("grand-canyon", "topic-terrain", "topic-water"),
    buildingDescentPreferred: false
  },
  {
    id: "amazon-rainforest",
    name: "Amazon Rainforest",
    kind: "wonder",
    category: "Tropical rainforest",
    coordinates: { latitude: -3.4653, longitude: -62.2159 },
    cameraPresetId: "amazon-rainforest",
    summary:
      "The Amazon is a vast tropical forest and river basin that stores carbon, recycles moisture, and supports extraordinary biodiversity.",
    facts: [
      "Forest transpiration helps move moisture through the regional atmosphere.",
      "The basin contains one of the world's largest river systems.",
      "Deforestation changes habitat, carbon storage, and local climate patterns."
    ],
    topics: ["ecosystems", "water", "human-impact", "biodiversity"],
    suggestedLayers: ["clouds", "weatherRadar"],
    sourceNoteIds: wonderSource(
      "amazon-rainforest",
      "topic-ecosystems",
      "topic-water",
      "topic-human-impact"
    ),
    buildingDescentPreferred: false
  },
  {
    id: "great-barrier-reef",
    name: "Great Barrier Reef",
    kind: "wonder",
    category: "Coral reef system",
    coordinates: { latitude: -18.2871, longitude: 147.6992 },
    cameraPresetId: "great-barrier-reef",
    summary:
      "The Great Barrier Reef is a living marine system shaped by warm shallow seas, biodiversity, and climate stress.",
    facts: [
      "Coral reefs are built by tiny animals living with photosynthetic algae.",
      "Ocean heat waves can trigger coral bleaching.",
      "Reef health connects water temperature, water clarity, and coastal runoff."
    ],
    topics: ["water", "ecosystems", "climate", "biodiversity"],
    suggestedLayers: ["clouds", "weatherRadar"],
    sourceNoteIds: wonderSource(
      "great-barrier-reef",
      "topic-water",
      "topic-ecosystems",
      "topic-climate"
    ),
    buildingDescentPreferred: false
  },
  {
    id: "sahara-desert",
    name: "Sahara Desert",
    kind: "wonder",
    category: "Subtropical desert",
    coordinates: { latitude: 23.4162, longitude: 25.6628 },
    cameraPresetId: "sahara-desert",
    summary:
      "The Sahara shows how atmospheric circulation, scarce rainfall, and surface heating create one of Earth's largest hot deserts.",
    facts: [
      "Descending dry air in subtropical high-pressure zones limits rainfall.",
      "Dust from the Sahara can travel across oceans and fertilize distant ecosystems.",
      "The desert includes dunes, rocky plateaus, dry valleys, and mountain massifs."
    ],
    topics: ["climate", "atmosphere", "terrain"],
    suggestedLayers: ["terrain", "clouds"],
    sourceNoteIds: wonderSource("sahara-desert", "topic-climate", "topic-atmosphere"),
    buildingDescentPreferred: false
  },
  {
    id: "antarctica",
    name: "Antarctica",
    kind: "wonder",
    category: "Polar ice sheet",
    coordinates: { latitude: -82.8628, longitude: 135 },
    cameraPresetId: "antarctica",
    summary:
      "Antarctica holds most of Earth's freshwater ice and strongly influences sea level, ocean circulation, and climate records.",
    facts: [
      "Ice cores preserve trapped air that helps reconstruct past atmospheres.",
      "The Antarctic Ice Sheet affects global sea-level projections.",
      "Katabatic winds and high elevation make the continent extremely cold and dry."
    ],
    topics: ["ice", "climate", "water"],
    suggestedLayers: ["terrain", "aurora"],
    sourceNoteIds: wonderSource("antarctica", "topic-ice", "topic-climate"),
    buildingDescentPreferred: false
  },
  {
    id: "himalayas",
    name: "Himalayas",
    kind: "wonder",
    category: "Mountain range",
    coordinates: { latitude: 30.0668, longitude: 79.0193 },
    cameraPresetId: "himalayas",
    summary:
      "The Himalayas are a broad mountain system where tectonic uplift, glaciers, and monsoon climate meet.",
    facts: [
      "The range continues to rise as the Indian Plate moves northward.",
      "Snow and glacier melt support river systems across South and Central Asia.",
      "Elevation creates strong climate gradients over short horizontal distances."
    ],
    topics: ["terrain", "geology", "ice", "water"],
    suggestedLayers: ["terrain", "clouds"],
    sourceNoteIds: wonderSource("himalayas", "topic-terrain", "topic-ice"),
    buildingDescentPreferred: false
  },
  {
    id: "aurora-region",
    name: "Aurora Region",
    kind: "wonder",
    category: "Polar atmosphere",
    coordinates: { latitude: 67.8558, longitude: -147.8563 },
    cameraPresetId: "aurora-region",
    summary:
      "Auroras occur when charged particles guided by Earth's magnetic field excite gases in the upper atmosphere near polar regions.",
    facts: [
      "Auroral displays are most common in high-latitude oval-shaped regions.",
      "Oxygen and nitrogen emissions create common green, red, and purple colors.",
      "MyEarth's aurora layer is illustrative and not a live space-weather feed."
    ],
    topics: ["atmosphere", "climate"],
    suggestedLayers: ["aurora", "atmosphere"],
    sourceNoteIds: wonderSource("aurora-region", "topic-atmosphere"),
    buildingDescentPreferred: false
  }
];

export const cityLocations: EarthLocation[] = [
  ["new-york-city", "New York City", 40.7128, -74.006],
  ["tokyo", "Tokyo", 35.6762, 139.6503],
  ["london", "London", 51.5072, -0.1276],
  ["paris", "Paris", 48.8566, 2.3522],
  ["dubai", "Dubai", 25.2048, 55.2708],
  ["san-francisco", "San Francisco", 37.7749, -122.4194],
  ["singapore", "Singapore", 1.3521, 103.8198]
].map(([id, name, latitude, longitude]) => ({
  id: id as string,
  name: name as string,
  kind: "city",
  category: "City shortcut",
  coordinates: { latitude: latitude as number, longitude: longitude as number },
  cameraPresetId: id as string,
  summary: `${name} demonstrates dense human settlement, night-light patterns, and optional 3D buildings as a secondary city descent.`,
  facts: [
    "Urban form concentrates infrastructure, energy use, and transportation networks.",
    "Night lights reveal broad patterns of settlement, not exact population counts.",
    "3D buildings are loaded opportunistically and may vary by data coverage."
  ],
  topics: ["urbanization", "human-impact"],
  suggestedLayers: ["buildings"],
  sourceNoteIds: [`location-${id}`, "topic-human-impact", "topic-night-lights"],
  buildingDescentPreferred: true
}));

export const earthLocations: EarthLocation[] = [
  ...wonderLocations,
  ...cityLocations
];

export const locationsById = Object.fromEntries(
  earthLocations.map((location) => [location.id, location])
) as Record<string, EarthLocation>;

export function getLocationById(id: string): EarthLocation | undefined {
  return locationsById[id];
}
