export type FrameHealth = "good" | "fair" | "poor";

export type FrameHealthMonitor = {
  recordFrame(deltaMs: number): FrameHealth;
  getHealth(): FrameHealth;
  reset(): void;
};

export function createFrameHealthMonitor(sampleSize = 30): FrameHealthMonitor {
  const samples: number[] = [];
  let health: FrameHealth = "good";

  return {
    recordFrame(deltaMs) {
      samples.push(deltaMs);
      if (samples.length > sampleSize) {
        samples.shift();
      }

      const average = samples.reduce((sum, next) => sum + next, 0) / samples.length;
      health = average > 42 ? "poor" : average > 26 ? "fair" : "good";
      return health;
    },
    getHealth() {
      return health;
    },
    reset() {
      samples.length = 0;
      health = "good";
    }
  };
}
