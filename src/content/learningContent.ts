import type { LearningPanelContent, LearningTopic } from "../shared/domain";
import { cityLocations, wonderLocations } from "./locations";

export const topicContent: Record<LearningTopic, LearningPanelContent> = {
  terrain: {
    id: "topic-terrain",
    title: "Terrain And Plate Tectonics",
    summary:
      "Terrain records the slow movement of plates, uplift, erosion, and volcanic or sedimentary processes.",
    sections: [
      {
        heading: "Read The Relief",
        body: "Mountains, trenches, basins, and plateaus are surface clues to forces working over millions of years."
      }
    ],
    facts: ["Plate boundaries often align with mountain belts, earthquakes, and volcanoes."],
    topics: ["terrain", "geology"],
    suggestedLayers: ["terrain"],
    sourceNoteIds: ["topic-terrain"]
  },
  climate: {
    id: "topic-climate",
    title: "Climate Systems",
    summary:
      "Climate emerges from sunlight, atmosphere, oceans, ice, land cover, and long-term feedbacks.",
    sections: [
      {
        heading: "Patterns Over Time",
        body: "Weather changes hour to hour, while climate describes patterns measured over years and decades."
      }
    ],
    facts: ["Latitude, elevation, ocean currents, and greenhouse gases all influence climate."],
    topics: ["climate"],
    suggestedLayers: ["clouds", "weatherRadar"],
    sourceNoteIds: ["topic-climate"]
  },
  ecosystems: {
    id: "topic-ecosystems",
    title: "Ecosystems And Biomes",
    summary:
      "Ecosystems link organisms with climate, water, soils, nutrients, and human pressures.",
    sections: [
      {
        heading: "Connected Systems",
        body: "Changing one part of an ecosystem can alter habitat, food webs, and resilience."
      }
    ],
    facts: ["Biodiversity can improve ecosystem resilience but does not make systems invulnerable."],
    topics: ["ecosystems", "biodiversity"],
    suggestedLayers: ["clouds"],
    sourceNoteIds: ["topic-ecosystems"]
  },
  atmosphere: {
    id: "topic-atmosphere",
    title: "Atmosphere And Weather",
    summary:
      "The atmosphere moves heat and moisture around Earth while protecting the surface from harsh space conditions.",
    sections: [
      {
        heading: "A Dynamic Shell",
        body: "Clouds, storms, auroras, and winds all express different layers and energy flows in the atmosphere."
      }
    ],
    facts: ["Auroras are upper-atmosphere light emissions, not weather clouds."],
    topics: ["atmosphere"],
    suggestedLayers: ["clouds", "weatherRadar", "aurora"],
    sourceNoteIds: ["topic-atmosphere"]
  },
  water: {
    id: "topic-water",
    title: "Water Cycle And Oceans",
    summary:
      "Water moves through oceans, air, ice, rivers, soils, and living systems as a planetary cycle.",
    sections: [
      {
        heading: "Movement Matters",
        body: "Evaporation, condensation, precipitation, runoff, and storage shape landscapes and ecosystems."
      }
    ],
    facts: ["Oceans store and transport heat, influencing weather and climate."],
    topics: ["water", "climate"],
    suggestedLayers: ["weatherRadar"],
    sourceNoteIds: ["topic-water"]
  },
  ice: {
    id: "topic-ice",
    title: "Ice And Polar Systems",
    summary:
      "Ice sheets, glaciers, sea ice, and snow influence sea level, reflectivity, ecosystems, and climate records.",
    sections: [
      {
        heading: "Frozen Archives",
        body: "Ice cores and glacier changes help scientists understand past and present climate conditions."
      }
    ],
    facts: ["Land ice loss contributes to sea-level rise."],
    topics: ["ice", "climate"],
    suggestedLayers: ["terrain", "aurora"],
    sourceNoteIds: ["topic-ice"]
  },
  "human-impact": {
    id: "topic-human-impact",
    title: "Human Impact",
    summary:
      "Human decisions alter land cover, emissions, water use, habitat, and nighttime visibility from space.",
    sections: [
      {
        heading: "Visible Footprints",
        body: "Urban areas, agriculture, roads, reservoirs, and lights reveal large-scale changes to Earth systems."
      }
    ],
    facts: ["The same satellite view can show both infrastructure and environmental pressure."],
    topics: ["human-impact", "urbanization"],
    suggestedLayers: ["buildings"],
    sourceNoteIds: ["topic-human-impact"]
  },
  urbanization: {
    id: "topic-urbanization",
    title: "Night Lights And Urbanization",
    summary:
      "Night lights reveal broad patterns of settlement, infrastructure, and economic activity, while requiring careful interpretation.",
    sections: [
      {
        heading: "Interpreting Light",
        body: "Brightness depends on lighting technology, cloud conditions, energy access, and observation timing."
      }
    ],
    facts: ["Night lights are useful for patterns, not exact population or wealth measurements."],
    topics: ["urbanization", "human-impact"],
    suggestedLayers: ["buildings"],
    sourceNoteIds: ["topic-night-lights"]
  },
  geology: {
    id: "topic-geology",
    title: "Geology",
    summary:
      "Geology explains the rocks, structures, and processes that create landscapes visible from orbit.",
    sections: [
      {
        heading: "Long Time Scales",
        body: "Rock layers, folds, faults, and erosion make slow planetary processes visible."
      }
    ],
    facts: ["Geologic structures often shape rivers, coastlines, mountains, and basins."],
    topics: ["geology", "terrain"],
    suggestedLayers: ["terrain"],
    sourceNoteIds: ["topic-terrain"]
  },
  biodiversity: {
    id: "topic-biodiversity",
    title: "Biodiversity",
    summary:
      "Biodiversity describes the variety of life, from genes and species to ecosystems and habitats.",
    sections: [
      {
        heading: "Life In Context",
        body: "Climate, water, soils, topography, and human pressure all affect where species can thrive."
      }
    ],
    facts: ["Biodiversity hotspots often coincide with unique habitats and high human pressure."],
    topics: ["biodiversity", "ecosystems"],
    suggestedLayers: ["clouds"],
    sourceNoteIds: ["topic-ecosystems"]
  }
};

const locationContentFromLocation = (
  locationId: string,
  compact = false
): LearningPanelContent => {
  const location = [...wonderLocations, ...cityLocations].find(
    (item) => item.id === locationId
  );

  if (!location) {
    return getFallbackLearningContent();
  }

  return {
    id: location.id,
    title: location.name,
    summary: location.summary,
    sections: [
      {
        heading: compact ? "City Signal" : "Earth System Lens",
        body: compact
          ? "Use the city shortcut to compare settlement, buildings, and night-light patterns without moving the app away from its natural-wonders focus."
          : `This stop connects ${location.name} to ${location.topics
              .map((topic) => topic.replace("-", " "))
              .join(", ")}.`
      }
    ],
    facts: location.facts,
    topics: location.topics,
    suggestedLayers: location.suggestedLayers,
    sourceNoteIds: location.sourceNoteIds,
    illustrativeDisclaimer:
      location.id === "aurora-region"
        ? "The aurora layer in MyEarth is illustrative and is not a live space-weather forecast."
        : undefined
  };
};

export const locationPanelContentById = Object.fromEntries([
  ...wonderLocations.map((location) => [
    location.id,
    locationContentFromLocation(location.id)
  ]),
  ...cityLocations.map((location) => [
    location.id,
    locationContentFromLocation(location.id, true)
  ])
]) as Record<string, LearningPanelContent>;

export function getLearningContentForLocation(
  locationId?: string
): LearningPanelContent {
  if (!locationId) {
    return getFallbackLearningContent();
  }

  return locationPanelContentById[locationId] ?? getFallbackLearningContent();
}

export function getTopicContent(topic: LearningTopic): LearningPanelContent {
  return topicContent[topic];
}

export function getFallbackLearningContent(): LearningPanelContent {
  return topicContent.terrain;
}
