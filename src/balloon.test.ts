// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Agent from "./agent.ts";
import Balloon from "./balloon.ts";

function createTarget() {
  const target = document.createElement("div");
  target.style.position = "fixed";
  target.style.top = "0";
  target.style.left = "0";
  target.style.width = "16px";
  target.style.height = "16px";
  document.body.appendChild(target);
  return target;
}

function createAgent() {
  return new Agent(
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
    {
      overlayCount: 1,
      framesize: [16, 16],
      sounds: [],
      tts: { rate: 1, pitch: 1, voice: "" },
      animations: {
        Idle1: {
          frames: [{ duration: 50, images: [[0, 0]] }],
        },
      },
    },
    {},
  );
}

describe("Balloon hold behavior", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("completes a held balloon after the text finished when closed", () => {
    const balloon = new Balloon(createTarget());
    const complete = vi.fn();

    balloon.speak(complete, "Hello world", true);
    vi.advanceTimersByTime(balloon.WORD_SPEAK_TIME * 2);

    expect(complete).not.toHaveBeenCalled();

    balloon.close();

    expect(complete).toHaveBeenCalledTimes(1);
    expect(balloon._balloon.style.display).toBe("none");

    balloon.dispose();
  });

  it("completes a held balloon exactly once when closed mid-stream", () => {
    const balloon = new Balloon(createTarget());
    const complete = vi.fn();

    balloon.speak(complete, "Hello from Clippy", true);
    balloon.close();
    vi.runOnlyPendingTimers();

    expect(complete).toHaveBeenCalledTimes(1);
    expect(balloon._balloon.style.display).toBe("none");

    balloon.dispose();
  });
});

describe("Agent.closeBalloon", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("releases the queued speak action for held balloons", () => {
    const agent = createAgent();
    agent._hidden = true;
    const nextAction = vi.fn();

    agent.speak("Queued hold", { hold: true });
    agent._addToQueue(function (complete) {
      nextAction();
      complete();
    }, agent);

    vi.advanceTimersByTime(agent._balloon.WORD_SPEAK_TIME * 2);
    expect(agent._queue._queue).toHaveLength(1);

    agent.closeBalloon();

    expect(nextAction).toHaveBeenCalledTimes(1);
    expect(agent._queue._queue).toHaveLength(0);
    expect(agent._queue._active).toBe(false);

    agent.dispose();
  });
});
