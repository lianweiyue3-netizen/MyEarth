export type DeviceProfile = {
  memoryGb?: number;
  hardwareConcurrency?: number;
  mobile: boolean;
  webglAvailable: boolean;
};

export function readDeviceProfile(navigatorLike: Navigator = navigator): DeviceProfile {
  const navWithMemory = navigatorLike as Navigator & { deviceMemory?: number };
  return {
    memoryGb: navWithMemory.deviceMemory,
    hardwareConcurrency: navigatorLike.hardwareConcurrency,
    mobile:
      navigatorLike.maxTouchPoints > 0 &&
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 800px)").matches,
    webglAvailable: isWebGlAvailable()
  };
}

export function isWebGlAvailable(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  const canvas = document.createElement("canvas");
  return Boolean(
    canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
  );
}
