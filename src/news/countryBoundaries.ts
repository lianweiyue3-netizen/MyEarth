export type NewsCountryBoundary = {
  countryCode: string;
  polygons: Array<Array<[longitude: number, latitude: number]>>;
};

type BoundingBox = {
  west: number;
  south: number;
  east: number;
  north: number;
};

const NEWS_COUNTRY_BOUNDARIES: readonly NewsCountryBoundary[] = [
  { countryCode: "au", polygons: [box({ west: 113, south: -44, east: 154, north: -10 })] },
  { countryCode: "br", polygons: [box({ west: -74, south: -34, east: -34, north: 6 })] },
  { countryCode: "ca", polygons: [box({ west: -141, south: 42, east: -52, north: 70 })] },
  { countryCode: "cn", polygons: [box({ west: 73, south: 18, east: 135, north: 54 })] },
  { countryCode: "eg", polygons: [box({ west: 25, south: 22, east: 36, north: 32 })] },
  { countryCode: "fr", polygons: [box({ west: -5, south: 42, east: 8, north: 51 })] },
  { countryCode: "de", polygons: [box({ west: 5, south: 47, east: 15, north: 55 })] },
  { countryCode: "gr", polygons: [box({ west: 19, south: 34, east: 29, north: 42 })] },
  {
    countryCode: "hk",
    polygons: [box({ west: 113.8, south: 22.1, east: 114.45, north: 22.6 })]
  },
  { countryCode: "in", polygons: [box({ west: 68, south: 7, east: 97, north: 36 })] },
  { countryCode: "ie", polygons: [box({ west: -10.7, south: 51.3, east: -5.4, north: 55.4 })] },
  { countryCode: "il", polygons: [box({ west: 34.2, south: 29.4, east: 35.9, north: 33.4 })] },
  { countryCode: "it", polygons: [box({ west: 6, south: 36, east: 19, north: 47 })] },
  { countryCode: "jp", polygons: [box({ west: 129, south: 31, east: 146, north: 46 })] },
  {
    countryCode: "my",
    polygons: [
      box({ west: 99.6, south: 1, east: 104.6, north: 7.4 }),
      box({ west: 109.5, south: 0.8, east: 119.3, north: 7.5 })
    ]
  },
  { countryCode: "nl", polygons: [box({ west: 3.2, south: 50.7, east: 7.2, north: 53.7 })] },
  { countryCode: "no", polygons: [box({ west: 4, south: 58, east: 31, north: 71 })] },
  { countryCode: "pk", polygons: [box({ west: 60, south: 23, east: 77, north: 37 })] },
  { countryCode: "pe", polygons: [box({ west: -82, south: -18, east: -68, north: 0 })] },
  { countryCode: "ph", polygons: [box({ west: 117, south: 5, east: 127, north: 19 })] },
  { countryCode: "pt", polygons: [box({ west: -9.6, south: 36.8, east: -6.1, north: 42.2 })] },
  { countryCode: "ro", polygons: [box({ west: 20, south: 43, east: 30, north: 49 })] },
  {
    countryCode: "ru",
    polygons: [
      box({ west: 30, south: 41, east: 180, north: 82 }),
      box({ west: -180, south: 55, east: -169, north: 72 })
    ]
  },
  {
    countryCode: "sg",
    polygons: [box({ west: 103.6, south: 1.16, east: 104.05, north: 1.48 })]
  },
  { countryCode: "es", polygons: [box({ west: -9.5, south: 36, east: 3.4, north: 44 })] },
  { countryCode: "se", polygons: [box({ west: 11, south: 55, east: 24, north: 69 })] },
  { countryCode: "ch", polygons: [box({ west: 5.9, south: 45.8, east: 10.5, north: 47.9 })] },
  { countryCode: "tw", polygons: [box({ west: 119.3, south: 21.8, east: 122.1, north: 25.4 })] },
  { countryCode: "ua", polygons: [box({ west: 22, south: 44, east: 40, north: 52 })] },
  { countryCode: "gb", polygons: [box({ west: -8.7, south: 49.8, east: 2, north: 59.5 })] },
  {
    countryCode: "us",
    polygons: [
      box({ west: -125, south: 24, east: -66, north: 49 }),
      box({ west: -170, south: 52, east: -130, north: 72 }),
      box({ west: -161, south: 18, east: -154, north: 23 })
    ]
  }
];

const BOUNDARY_BY_CODE = new Map(
  NEWS_COUNTRY_BOUNDARIES.map((boundary) => [boundary.countryCode, boundary])
);

export function getNewsCountryBoundary(code: string): NewsCountryBoundary | undefined {
  return BOUNDARY_BY_CODE.get(code.trim().toLowerCase());
}

export function listNewsCountryBoundaries(): readonly NewsCountryBoundary[] {
  return NEWS_COUNTRY_BOUNDARIES;
}

export function hasNewsCountryBoundary(code: string): boolean {
  return getNewsCountryBoundary(code) !== undefined;
}

function box({ west, south, east, north }: BoundingBox): Array<[number, number]> {
  return [
    [west, south],
    [east, south],
    [east, north],
    [west, north],
    [west, south]
  ];
}
