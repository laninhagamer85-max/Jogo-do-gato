export type PetMotionInput = {
  grounded: boolean;
  horizontalSpeed: number;
  verticalSpeed: number;
  elapsed: number;
  landingFor: number;
  walkCycle?: number;
};

export type PetMotionPose = {
  state: "idle" | "run" | "rise" | "fall" | "land";
  sprite: "rest" | "run";
  bobY: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};

/** Presentation-only poses; this never changes position, collision, velocity or scoring. */
export function getPetMotionPose(input: PetMotionInput): PetMotionPose {
  const { grounded, horizontalSpeed, verticalSpeed, elapsed, landingFor } = input;
  const moving = grounded && Math.abs(horizontalSpeed) > 8;

  if (landingFor > 0) {
    const progress = Math.max(0, Math.min(1, 1 - landingFor / 0.16));
    const squash = Math.sin(progress * Math.PI) * 0.105;
    return {
      state: "land",
      sprite: moving ? "run" : "rest",
      bobY: squash * 3,
      scaleX: 1 + squash * 0.6,
      scaleY: 1 - squash,
      rotation: 0,
    };
  }

  if (!grounded) {
    const rising = verticalSpeed < -55;
    return {
      state: rising ? "rise" : "fall",
      sprite: "run",
      bobY: 0,
      scaleX: rising ? 0.96 : 1.035,
      scaleY: rising ? 1.075 : 0.965,
      rotation: rising ? -0.105 : 0.075,
    };
  }

  if (moving) {
    const stride = input.walkCycle ?? elapsed * 13.5;
    const bounce = Math.abs(Math.sin(stride));
    return {
      state: "run",
      sprite: "run",
      bobY: bounce * 3.4,
      scaleX: 1 + bounce * 0.026,
      scaleY: 1 - bounce * 0.035,
      rotation: Math.sin(stride) * 0.035,
    };
  }

  const breath = Math.sin(elapsed * 2.7);
  return {
    state: "idle",
    sprite: "rest",
    bobY: breath * 0.9,
    scaleX: 1 - breath * 0.006,
    scaleY: 1 + breath * 0.012,
    rotation: Math.sin(elapsed * 1.35) * 0.012,
  };
}
