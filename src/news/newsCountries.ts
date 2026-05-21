export type NewsCountryDefinition = {
  code: string;
  name: string;
  centroid: {
    latitude: number;
    longitude: number;
  };
  cameraHeightMeters: number;
};

const NEWS_COUNTRIES = [
  {
    code: "au",
    name: "Australia",
    centroid: { latitude: -25.2744, longitude: 133.7751 },
    cameraHeightMeters: 5_500_000
  },
  {
    code: "br",
    name: "Brazil",
    centroid: { latitude: -14.235, longitude: -51.9253 },
    cameraHeightMeters: 5_500_000
  },
  {
    code: "ca",
    name: "Canada",
    centroid: { latitude: 56.1304, longitude: -106.3468 },
    cameraHeightMeters: 6_500_000
  },
  {
    code: "cn",
    name: "China",
    centroid: { latitude: 35.8617, longitude: 104.1954 },
    cameraHeightMeters: 5_500_000
  },
  {
    code: "eg",
    name: "Egypt",
    centroid: { latitude: 26.8206, longitude: 30.8025 },
    cameraHeightMeters: 2_700_000
  },
  {
    code: "fr",
    name: "France",
    centroid: { latitude: 46.2276, longitude: 2.2137 },
    cameraHeightMeters: 2_600_000
  },
  {
    code: "de",
    name: "Germany",
    centroid: { latitude: 51.1657, longitude: 10.4515 },
    cameraHeightMeters: 2_300_000
  },
  {
    code: "gr",
    name: "Greece",
    centroid: { latitude: 39.0742, longitude: 21.8243 },
    cameraHeightMeters: 1_700_000
  },
  {
    code: "hk",
    name: "Hong Kong",
    centroid: { latitude: 22.3193, longitude: 114.1694 },
    cameraHeightMeters: 450_000
  },
  {
    code: "in",
    name: "India",
    centroid: { latitude: 20.5937, longitude: 78.9629 },
    cameraHeightMeters: 4_800_000
  },
  {
    code: "ie",
    name: "Ireland",
    centroid: { latitude: 53.4129, longitude: -8.2439 },
    cameraHeightMeters: 1_200_000
  },
  {
    code: "il",
    name: "Israel",
    centroid: { latitude: 31.0461, longitude: 34.8516 },
    cameraHeightMeters: 900_000
  },
  {
    code: "it",
    name: "Italy",
    centroid: { latitude: 41.8719, longitude: 12.5674 },
    cameraHeightMeters: 2_200_000
  },
  {
    code: "jp",
    name: "Japan",
    centroid: { latitude: 36.2048, longitude: 138.2529 },
    cameraHeightMeters: 2_800_000
  },
  {
    code: "nl",
    name: "Netherlands",
    centroid: { latitude: 52.1326, longitude: 5.2913 },
    cameraHeightMeters: 850_000
  },
  {
    code: "no",
    name: "Norway",
    centroid: { latitude: 60.472, longitude: 8.4689 },
    cameraHeightMeters: 3_000_000
  },
  {
    code: "pk",
    name: "Pakistan",
    centroid: { latitude: 30.3753, longitude: 69.3451 },
    cameraHeightMeters: 2_800_000
  },
  {
    code: "pe",
    name: "Peru",
    centroid: { latitude: -9.19, longitude: -75.0152 },
    cameraHeightMeters: 3_000_000
  },
  {
    code: "ph",
    name: "Philippines",
    centroid: { latitude: 12.8797, longitude: 121.774 },
    cameraHeightMeters: 2_300_000
  },
  {
    code: "pt",
    name: "Portugal",
    centroid: { latitude: 39.3999, longitude: -8.2245 },
    cameraHeightMeters: 1_300_000
  },
  {
    code: "ro",
    name: "Romania",
    centroid: { latitude: 45.9432, longitude: 24.9668 },
    cameraHeightMeters: 1_700_000
  },
  {
    code: "ru",
    name: "Russian Federation",
    centroid: { latitude: 61.524, longitude: 105.3188 },
    cameraHeightMeters: 8_000_000
  },
  {
    code: "sg",
    name: "Singapore",
    centroid: { latitude: 1.3521, longitude: 103.8198 },
    cameraHeightMeters: 350_000
  },
  {
    code: "es",
    name: "Spain",
    centroid: { latitude: 40.4637, longitude: -3.7492 },
    cameraHeightMeters: 2_300_000
  },
  {
    code: "se",
    name: "Sweden",
    centroid: { latitude: 60.1282, longitude: 18.6435 },
    cameraHeightMeters: 2_700_000
  },
  {
    code: "ch",
    name: "Switzerland",
    centroid: { latitude: 46.8182, longitude: 8.2275 },
    cameraHeightMeters: 900_000
  },
  {
    code: "tw",
    name: "Taiwan",
    centroid: { latitude: 23.6978, longitude: 120.9605 },
    cameraHeightMeters: 1_000_000
  },
  {
    code: "ua",
    name: "Ukraine",
    centroid: { latitude: 48.3794, longitude: 31.1656 },
    cameraHeightMeters: 2_300_000
  },
  {
    code: "gb",
    name: "United Kingdom",
    centroid: { latitude: 55.3781, longitude: -3.436 },
    cameraHeightMeters: 1_800_000
  },
  {
    code: "us",
    name: "United States",
    centroid: { latitude: 39.8283, longitude: -98.5795 },
    cameraHeightMeters: 5_500_000
  }
] as const satisfies readonly NewsCountryDefinition[];

const COUNTRY_BY_CODE = new Map<string, NewsCountryDefinition>(
  NEWS_COUNTRIES.map((country) => [country.code, country])
);

export function getNewsCountry(code: string): NewsCountryDefinition | undefined {
  return COUNTRY_BY_CODE.get(code.trim().toLowerCase());
}

export function listNewsCountries(): readonly NewsCountryDefinition[] {
  return NEWS_COUNTRIES;
}
