import type { CameraCommand, TourController, TourState } from "../shared/domain";
import { wonderLocations } from "../content/locations";

export type TourControllerOptions = {
  onStateChange: (state: TourState) => void;
  onSelectLocation: (locationId: string) => void;
  onCameraCommand: (command: CameraCommand) => Promise<void> | void;
  onError?: (message: string) => void;
};

export const tourLocationIds = wonderLocations.map((location) => location.id);

export function createTourController(options: TourControllerOptions): TourController {
  let state: TourState = { status: "idle", currentIndex: 0 };

  const publish = (next: TourState) => {
    state = next;
    options.onStateChange(next);
  };

  const goTo = async (index: number, status: TourState["status"] = "playing") => {
    const locationId = tourLocationIds[index];
    options.onSelectLocation(locationId);
    publish({ status, currentIndex: index, currentLocationId: locationId });
    try {
      await options.onCameraCommand({
        type: "flyToLocation",
        locationId,
        source: "wonder"
      });
    } catch {
      publish({ ...state, status: "paused" });
      options.onError?.("Tour paused because the camera transition failed.");
    }
  };

  return {
    start() {
      void goTo(0);
    },
    pause() {
      publish({ ...state, status: "paused" });
    },
    resume() {
      void goTo(state.currentIndex, "playing");
    },
    next() {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= tourLocationIds.length) {
        publish({ ...state, status: "complete" });
        return;
      }
      void goTo(nextIndex);
    },
    previous() {
      void goTo(Math.max(0, state.currentIndex - 1));
    },
    stop() {
      publish({ ...state, status: "idle" });
    }
  };
}
