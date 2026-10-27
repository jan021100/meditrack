export type PromInput = {
  painBefore: number | null | undefined;
  painDuringHealing: number | null | undefined;
  painToday: number | null | undefined;
  satisfaction: number | null | undefined;
  missedDays: number | null | undefined;
  qolImpact: string;
  sameSurgery: string;
  comments: string;
};

/** Missing answers remain null. Version 2 distinguishes explicit entries from old slider defaults. */
export function buildProm(input: PromInput) {
  const result = { ...input, painBefore: input.painBefore ?? null, painDuringHealing: input.painDuringHealing ?? null,
    painToday: input.painToday ?? null, satisfaction: input.satisfaction ?? null, missedDays: input.missedDays ?? null,
    promSchemaVersion: 2 };
  for (const key of ['painBefore', 'painDuringHealing', 'painToday', 'satisfaction'] as const) {
    const value = result[key];
    if (value !== null && (!Number.isInteger(value) || value < 0 || value > 10)) throw new Error('Scores must be whole numbers from 0 to 10.');
  }
  if (result.missedDays !== null && (!Number.isInteger(result.missedDays) || result.missedDays < 0)) throw new Error('Days absent must be a non-negative whole number.');
  if ([result.painBefore, result.painDuringHealing, result.painToday, result.satisfaction, result.missedDays].every(value => value === null)
      && !result.qolImpact && !result.sameSurgery && !result.comments.trim()) throw new Error('Enter at least one response before saving.');
  return result;
}
