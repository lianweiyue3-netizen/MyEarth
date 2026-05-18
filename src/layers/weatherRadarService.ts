import { RAINVIEWER_METADATA_URL } from "../config/constants";
import type { WeatherRadarService } from "../shared/domain";

type RainViewerFrame = {
  path: string;
  time: number;
};

type RainViewerMetadata = {
  host: string;
  radar?: {
    past?: RainViewerFrame[];
  };
};

const CACHE_MS = 10 * 60 * 1000;

export function createWeatherRadarService(
  fetcher: typeof fetch = fetch,
  now: () => number = () => Date.now()
): WeatherRadarService {
  let cached:
    | {
        expiresAt: number;
        frame: { host: string; path: string; time: number };
      }
    | undefined;

  return {
    async getLatestFrame(signal) {
      if (cached && cached.expiresAt > now()) {
        return cached.frame;
      }

      const response = await fetcher(RAINVIEWER_METADATA_URL, { signal });
      if (!response.ok) {
        throw new Error("RainViewer metadata unavailable");
      }

      const metadata = (await response.json()) as RainViewerMetadata;
      const frames = metadata.radar?.past ?? [];
      const latest = frames[frames.length - 1];
      if (!metadata.host || !latest?.path) {
        throw new Error("RainViewer metadata did not include a radar frame");
      }

      cached = {
        expiresAt: now() + CACHE_MS,
        frame: {
          host: metadata.host,
          path: latest.path,
          time: latest.time
        }
      };
      return cached.frame;
    },
    clearCache() {
      cached = undefined;
    }
  };
}
