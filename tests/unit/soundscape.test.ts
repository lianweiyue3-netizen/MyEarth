import { describe, expect, it, vi } from "vitest";
import { createSoundscape, SOUNDTRACK_SRC } from "../../src/sound/soundscape";

function createAudioElement() {
  return {
    currentTime: 0,
    loop: false,
    pause: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    preload: "",
    src: "",
    volume: 0
  };
}

describe("soundscape", () => {
  it("plays the supplied MP3 soundtrack and loops it", async () => {
    const audio = createAudioElement();
    const createAudio = vi.fn(() => audio);
    const soundscape = createSoundscape(undefined, createAudio);

    await expect(soundscape.enable()).resolves.toEqual({
      status: "enabled",
      volume: 0.18
    });

    expect(createAudio).toHaveBeenCalledOnce();
    expect(audio.src).toBe(SOUNDTRACK_SRC);
    expect(audio.loop).toBe(true);
    expect(audio.preload).toBe("auto");
    expect(audio.play).toHaveBeenCalledOnce();

    soundscape.setVolume(0.42);
    expect(audio.volume).toBe(0.42);

    await soundscape.disable();
    expect(audio.pause).toHaveBeenCalledOnce();

    soundscape.dispose();
    expect(audio.currentTime).toBe(0);
  });
});
