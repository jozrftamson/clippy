// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Agent from "./agent.ts";
import Animator from "./animator.ts";

function createAgentWithMoveAnimations() {
  return new Agent(
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
    {
      overlayCount: 1,
      framesize: [16, 16],
      sounds: [],
      tts: { rate: 1, pitch: 1, voice: "" },
      animations: {
        Idle1: {
          frames: [{ duration: 20, images: [[0, 0]] }],
        },
        MoveLeft: {
          frames: [{ duration: 20, images: [[0, 0]] }],
        },
        MoveRight: {
          frames: [{ duration: 20, images: [[0, 0]] }],
        },
        MoveUp: {
          frames: [{ duration: 20, images: [[0, 0]] }],
        },
        MoveDown: {
          frames: [{ duration: 20, images: [[0, 0]] }],
        },
      },
    },
    {},
  );
}

describe("Agent.moveTo", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("falls back to movement tween when Move animation exits without WAITING", () => {
    const agent = createAgentWithMoveAnimations();
    const playInternalSpy = vi
      .spyOn(agent, "_playInternal")
      .mockImplementation((_animation, cb) => {
        cb("MoveLeft", Animator.States.EXITED);
      });

    const tweenSpy = vi
      .spyOn(agent, "_animate")
      .mockImplementation((element, props, _duration, callback) => {
        for (const prop in props) {
          element.style[prop] = `${props[prop]}px`;
        }
        if (callback) callback();
      });

    const nextAction = vi.fn();
    agent.moveTo(300, 120, 200);
    agent._addToQueue(function (complete) {
      nextAction();
      complete();
    }, agent);

    expect(tweenSpy).toHaveBeenCalledTimes(1);
    expect(playInternalSpy).toHaveBeenCalledTimes(1);
    expect(nextAction).toHaveBeenCalledTimes(1);

    agent.dispose();
  });
});
