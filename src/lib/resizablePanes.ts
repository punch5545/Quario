export type ResizeVerticalStackInput = {
  before: number;
  after: number;
  delta: number;
  minBefore: number;
  minAfter: number;
};

export function clampPaneSize(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function resizeVerticalStack(input: ResizeVerticalStackInput): {
  before: number;
  after: number;
} {
  const total = input.before + input.after;
  const requestedBefore = input.before + input.delta;
  const maxBefore = total - input.minAfter;
  const before = clampPaneSize(requestedBefore, input.minBefore, maxBefore);

  return {
    before,
    after: total - before,
  };
}
