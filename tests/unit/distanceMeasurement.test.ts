import { describe, expect, it } from "vitest";
import {
  addDistancePoint,
  computeDistanceMeters,
  emptyDistanceMeasurement,
  formatDistanceMeters
} from "../../src/measurement/distanceMeasurement";

describe("distance measurement", () => {
  it("computes great-circle distance between two points", () => {
    expect(
      computeDistanceMeters(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 }
      )
    ).toBeCloseTo(111_195, -1);
  });

  it("collects two points and then starts a new measurement", () => {
    const first = addDistancePoint(emptyDistanceMeasurement, {
      latitude: 0,
      longitude: 0
    });
    const second = addDistancePoint(first, {
      latitude: 0,
      longitude: 1
    });
    const restarted = addDistancePoint(second, {
      latitude: 1,
      longitude: 1
    });

    expect(first.points).toHaveLength(1);
    expect(second.points).toHaveLength(2);
    expect(second.distanceMeters).toBeGreaterThan(111_000);
    expect(restarted.points).toEqual([{ latitude: 1, longitude: 1 }]);
    expect(restarted.distanceMeters).toBeUndefined();
  });

  it("formats meter and kilometer distances", () => {
    expect(formatDistanceMeters(320)).toBe("320 m");
    expect(formatDistanceMeters(1250)).toBe("1.25 km");
    expect(formatDistanceMeters(12_500)).toBe("12.5 km");
  });
});
