import type { Soundscape, SoundState } from "../shared/domain";

type AudioContextConstructor = typeof AudioContext;

export function createSoundscape(
  onStateChange?: (state: SoundState) => void,
  AudioCtor: AudioContextConstructor | undefined =
    typeof AudioContext === "undefined" ? undefined : AudioContext
): Soundscape {
  let context: AudioContext | undefined;
  let gain: GainNode | undefined;
  let oscillator: OscillatorNode | undefined;
  let state: SoundState = { status: "notPrompted" };

  const publish = (next: SoundState) => {
    state = next;
    onStateChange?.(next);
  };

  const stopNodes = () => {
    try {
      oscillator?.stop();
    } catch {
      // Stopping an already stopped oscillator is harmless.
    }
    oscillator = undefined;
    gain = undefined;
  };

  return {
    prompt() {
      if (state.status === "notPrompted") {
        publish({ status: "promptVisible" });
      }
    },
    async enable() {
      if (!AudioCtor) {
        const unavailable = {
          status: "unavailable",
          reason: "Web Audio is not available in this browser."
        } satisfies SoundState;
        publish(unavailable);
        return unavailable;
      }

      try {
        context = context ?? new AudioCtor();
        gain = context.createGain();
        gain.gain.value = 0.12;
        oscillator = context.createOscillator();
        oscillator.type = "sine";
        oscillator.frequency.value = 174;
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();
        await context.resume();
        const enabled = { status: "enabled", volume: 0.12 } satisfies SoundState;
        publish(enabled);
        return enabled;
      } catch {
        const unavailable = {
          status: "unavailable",
          reason: "The browser blocked Web Audio startup."
        } satisfies SoundState;
        publish(unavailable);
        return unavailable;
      }
    },
    async disable() {
      stopNodes();
      await context?.suspend();
      const disabled = { status: "disabled" } satisfies SoundState;
      publish(disabled);
      return disabled;
    },
    setVolume(volume) {
      if (gain) {
        gain.gain.value = Math.min(1, Math.max(0, volume));
        publish({ status: "enabled", volume: gain.gain.value });
      }
    },
    dispose() {
      stopNodes();
      void context?.close();
      context = undefined;
    }
  };
}
