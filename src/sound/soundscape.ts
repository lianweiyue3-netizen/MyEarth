import type { Soundscape, SoundState } from "../shared/domain";

type AudioElement = {
  currentTime: number;
  loop: boolean;
  pause(): void;
  play(): Promise<void>;
  preload: string;
  src: string;
  volume: number;
};
type AudioElementFactory = () => AudioElement;

export const SOUNDTRACK_SRC = "/audio/2am.mp3";

const DEFAULT_VOLUME = 0.18;

export function createSoundscape(
  onStateChange?: (state: SoundState) => void,
  createAudioElement: AudioElementFactory | undefined =
    typeof Audio === "undefined" ? undefined : () => new Audio(SOUNDTRACK_SRC)
): Soundscape {
  let audio: AudioElement | undefined;
  let state: SoundState = { status: "notPrompted" };

  const publish = (next: SoundState) => {
    state = next;
    onStateChange?.(next);
  };

  const ensureAudio = () => {
    audio = audio ?? createAudioElement?.();
    if (!audio) {
      return undefined;
    }

    audio.src = SOUNDTRACK_SRC;
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = DEFAULT_VOLUME;
    return audio;
  };

  return {
    prompt() {
      if (state.status === "notPrompted") {
        publish({ status: "promptVisible" });
      }
    },
    async enable() {
      const track = ensureAudio();
      if (!track) {
        const unavailable = {
          status: "unavailable",
          reason: "Audio playback is not available in this browser."
        } satisfies SoundState;
        publish(unavailable);
        return unavailable;
      }

      try {
        await track.play();
        const enabled = {
          status: "enabled",
          volume: track.volume
        } satisfies SoundState;
        publish(enabled);
        return enabled;
      } catch {
        const unavailable = {
          status: "unavailable",
          reason: "The browser blocked audio startup."
        } satisfies SoundState;
        publish(unavailable);
        return unavailable;
      }
    },
    async disable() {
      audio?.pause();
      const disabled = { status: "disabled" } satisfies SoundState;
      publish(disabled);
      return disabled;
    },
    setVolume(volume) {
      if (audio) {
        audio.volume = Math.min(1, Math.max(0, volume));
        publish({ status: "enabled", volume: audio.volume });
      }
    },
    dispose() {
      audio?.pause();
      if (audio) {
        audio.currentTime = 0;
      }
      audio = undefined;
    }
  };
}
