import type { QualityMode, QualityProfile } from "../shared/domain";
import type { DeviceProfile } from "./deviceProfile";

export const qualityProfiles: Record<"high" | "balanced" | "low", QualityProfile> = {
  high: {
    mode: "high",
    effectiveTier: "high",
    starDensity: "high",
    cinematicGlow: "full",
    clouds: "full",
    aurora: "full",
    radar: "full",
    buildings: "on",
    terrainDetail: "normal",
    transitionScale: 1
  },
  balanced: {
    mode: "balanced",
    effectiveTier: "balanced",
    starDensity: "medium",
    cinematicGlow: "reduced",
    clouds: "simple",
    aurora: "simple",
    radar: "reducedOpacity",
    buildings: "on",
    terrainDetail: "normal",
    transitionScale: 0.82
  },
  low: {
    mode: "low",
    effectiveTier: "low",
    starDensity: "low",
    cinematicGlow: "minimal",
    clouds: "off",
    aurora: "off",
    radar: "off",
    buildings: "off",
    terrainDetail: "reduced",
    transitionScale: 0.55
  }
};

export const defaultQualityProfile: QualityProfile = {
  ...qualityProfiles.balanced,
  mode: "auto"
};

export function computeQualityProfile(
  mode: QualityMode,
  profile: Partial<DeviceProfile> = {},
  reducedMotion = false
): QualityProfile {
  const tier =
    mode === "auto"
      ? selectAutoTier(profile)
      : (mode as Exclude<QualityMode, "auto">);

  const base = { ...qualityProfiles[tier], mode };
  return reducedMotion
    ? { ...base, transitionScale: Math.min(base.transitionScale, 0.35) }
    : base;
}

export function selectAutoTier(
  profile: Partial<DeviceProfile>
): "high" | "balanced" | "low" {
  if (profile.webglAvailable === false) {
    return "low";
  }

  if (profile.mobile || (profile.memoryGb !== undefined && profile.memoryGb <= 4)) {
    return "low";
  }

  if (
    (profile.memoryGb !== undefined && profile.memoryGb >= 12) ||
    (profile.hardwareConcurrency !== undefined && profile.hardwareConcurrency >= 8)
  ) {
    return "high";
  }

  return "balanced";
}

export function downgradeQuality(profile: QualityProfile): QualityProfile {
  if (profile.effectiveTier === "high") {
    return { ...qualityProfiles.balanced, mode: profile.mode };
  }
  if (profile.effectiveTier === "balanced") {
    return { ...qualityProfiles.low, mode: profile.mode };
  }
  return profile;
}
