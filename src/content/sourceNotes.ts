import type { LearningTopic } from "../shared/domain";

export type SourceNote = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  purpose: string;
  topics: LearningTopic[];
};

const topicNotes: SourceNote[] = [
  {
    id: "topic-terrain",
    title: "This Dynamic Earth",
    publisher: "U.S. Geological Survey",
    url: "https://pubs.usgs.gov/gip/dynamic/dynamic.html",
    purpose: "Plate tectonics and terrain formation baseline.",
    topics: ["terrain", "geology"]
  },
  {
    id: "topic-climate",
    title: "Climate Change: How Do We Know?",
    publisher: "NASA",
    url: "https://climate.nasa.gov/evidence/",
    purpose: "Climate system and observed change context.",
    topics: ["climate", "human-impact"]
  },
  {
    id: "topic-ecosystems",
    title: "Ecosystems",
    publisher: "National Geographic Society",
    url: "https://education.nationalgeographic.org/resource/ecosystem/",
    purpose: "Biome and ecosystem overview for learners.",
    topics: ["ecosystems", "biodiversity"]
  },
  {
    id: "topic-atmosphere",
    title: "Earth's Atmosphere",
    publisher: "NASA Space Place",
    url: "https://spaceplace.nasa.gov/atmosphere/en/",
    purpose: "Atmosphere layers, weather, and sky context.",
    topics: ["atmosphere", "climate"]
  },
  {
    id: "topic-water",
    title: "The Water Cycle",
    publisher: "NOAA",
    url: "https://www.noaa.gov/education/resource-collections/freshwater/water-cycle",
    purpose: "Water cycle and ocean-atmosphere learning baseline.",
    topics: ["water", "climate"]
  },
  {
    id: "topic-ice",
    title: "Ice Sheets",
    publisher: "National Snow and Ice Data Center",
    url: "https://nsidc.org/learn/parts-cryosphere/ice-sheets",
    purpose: "Polar ice and sea-level context.",
    topics: ["ice", "climate"]
  },
  {
    id: "topic-human-impact",
    title: "Human Impacts on the Environment",
    publisher: "United Nations Environment Programme",
    url: "https://www.unep.org/explore-topics/resource-efficiency/what-we-do/cities",
    purpose: "Urbanization and human impact context.",
    topics: ["human-impact", "urbanization"]
  },
  {
    id: "topic-night-lights",
    title: "Black Marble",
    publisher: "NASA Earth Observatory",
    url: "https://earthobservatory.nasa.gov/features/NightLights",
    purpose: "Night lights and urbanization interpretation.",
    topics: ["urbanization", "human-impact"]
  }
];

const locationNotes: SourceNote[] = [
  ["mount-everest", "Mount Everest", "terrain"],
  ["grand-canyon", "Grand Canyon", "geology"],
  ["amazon-rainforest", "Amazon Rainforest", "ecosystems"],
  ["great-barrier-reef", "Great Barrier Reef", "water"],
  ["sahara-desert", "Sahara Desert", "climate"],
  ["antarctica", "Antarctica", "ice"],
  ["himalayas", "Himalayas", "geology"],
  ["aurora-region", "Aurora Region", "atmosphere"],
  ["new-york-city", "New York City", "urbanization"],
  ["tokyo", "Tokyo", "urbanization"],
  ["london", "London", "urbanization"],
  ["paris", "Paris", "urbanization"],
  ["dubai", "Dubai", "urbanization"],
  ["san-francisco", "San Francisco", "urbanization"],
  ["singapore", "Singapore", "urbanization"]
].map(([id, name, topic]) => ({
  id: `location-${id}`,
  title: `${name} reference profile`,
  publisher: "MyEarth curated education notes",
  url: `https://www.wikidata.org/wiki/Special:Search?search=${encodeURIComponent(
    name
  )}`,
  purpose: `Location context for ${name}.`,
  topics: [topic as LearningTopic]
}));

export const sourceNotes: SourceNote[] = [...topicNotes, ...locationNotes];

export const sourceNotesById = Object.fromEntries(
  sourceNotes.map((note) => [note.id, note])
) as Record<string, SourceNote>;

export function getSourceNote(id: string): SourceNote | undefined {
  return sourceNotesById[id];
}

export function validateSourceNotes(notes: SourceNote[] = sourceNotes): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const note of notes) {
    if (ids.has(note.id)) {
      errors.push(`Duplicate source note id: ${note.id}`);
    }
    ids.add(note.id);

    if (!note.title || !note.publisher || !note.url || !note.purpose) {
      errors.push(`Source note ${note.id} is missing required metadata`);
    }

    try {
      new URL(note.url);
    } catch {
      errors.push(`Source note ${note.id} has an invalid URL`);
    }
  }

  return errors;
}
