import type { DistanceMeasurement, MapMeasurePoint } from "../shared/domain";

const EARTH_RADIUS_METERS = 6_371_008.8;

export const emptyDistanceMeasurement: DistanceMeasurement = {
  active: false,
  points: []
};

export function addDistancePoint(
  measurement: DistanceMeasurement,
  point: MapMeasurePoint
): DistanceMeasurement {
  const points = measurement.points.length >= 2 ? [point] : [...measurement.points, point];
  const distanceMeters =
    points.length === 2 ? computeDistanceMeters(points[0], points[1]) : undefined;

  return {
    active: true,
    points,
    distanceMeters
  };
}

export function computeDistanceMeters(
  start: MapMeasurePoint,
  end: MapMeasurePoint
): number {
  const startLatitude = toRadians(start.latitude);
  const endLatitude = toRadians(end.latitude);
  const latitudeDelta = toRadians(end.latitude - start.latitude);
  const longitudeDelta = toRadians(end.longitude - start.longitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function formatDistanceMeters(distanceMeters: number): string {
  if (distanceMeters >= 1_000_000) {
    return `${(distanceMeters / 1000).toFixed(0)} km`;
  }

  if (distanceMeters >= 10_000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }

  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(2)} km`;
  }

  return `${Math.round(distanceMeters)} m`;
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}
