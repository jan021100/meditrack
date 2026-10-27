export type Values = Record<string, unknown>;
export type AnalysisCase = { id: string; patient: Values; followups: Values[]; surgeries: Values[]; proms: Values[] };

const number = (value: unknown): number | null => {
  if (typeof value !== 'number' && !(typeof value === 'string' && /^\d+(\.\d+)?$/.test(value))) return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
};
function date(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const result = new Date(value + 'T00:00:00Z');
  return !Number.isNaN(result.getTime()) && result.toISOString().slice(0, 10) === value ? result : null;
}
export function isSynthetic(record: Values) {
  return record.excludeFromAnalysis === true || record.dataOrigin === 'synthetic_test'
    || [record.comments, record.baselineComments].some(value => typeof value === 'string' && /SYNTHETIC E2E/i.test(value));
}
export function origin(record: Values) {
  return record.dataOrigin === 'published_individual_case' ? 'literature' : 'regular';
}
export function distribution(values: unknown[]) {
  const counts = new Map<string, number>();
  for (const value of values) {
    const label = typeof value === 'string' && value.trim() ? value.trim() : 'Not recorded';
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
export function descriptive(values: (number | null)[]) {
  const valid = values.filter((value): value is number => value !== null && Number.isFinite(value)).sort((a, b) => a - b);
  const middle = Math.floor(valid.length / 2);
  return { n: valid.length, missing: values.length - valid.length,
    median: valid.length ? (valid[middle] + valid[Math.floor((valid.length - 1) / 2)]) / 2 : null,
    min: valid[0] ?? null, max: valid.at(-1) ?? null };
}
function age(record: Values) {
  // Never derive a birth date from reported age, nor use today's age for an old operation.
  const reported = number(record.ageAtPresentation);
  if (reported !== null) return reported >= 0 && reported <= 120 ? reported : null;
  const birth = date(record.birthDate), operation = date(record.operationDate);
  if (!birth || !operation || operation < birth) return null;
  const years = operation.getUTCFullYear() - birth.getUTCFullYear()
    - (operation.getUTCMonth() < birth.getUTCMonth() || (operation.getUTCMonth() === birth.getUTCMonth() && operation.getUTCDate() < birth.getUTCDate()) ? 1 : 0);
  return years <= 120 ? years : null;
}
function healing(item: AnalysisCase) {
  // Only initial/index procedure data: later operations cannot be silently mixed in.
  if (origin(item.patient) === 'literature') {
    const durations = item.followups.filter(entry => (!entry.operationId || entry.operationId === 'initial') && typeof entry.woundStatus === 'string' && ['healed', 'completely healed', 'complete epithelialization reported'].includes(entry.woundStatus.trim().toLowerCase()))
      .map(entry => number(entry.followUpIntervalDays)).filter((value): value is number => value !== null && value >= 0);
    return durations.length ? Math.min(...durations) : null;
  }
  const operation = date(item.patient.operationDate);
  if (!operation) return null;
  // New linked follow-ups can establish initial-operation healing without rewriting the parent.
  const candidates = [date(item.patient.dateHealed), ...item.followups.filter(entry => entry.operationId === 'initial')
    .map(entry => date(entry.completeHealingDate))].filter((value): value is Date => value !== null && value >= operation);
  return candidates.length ? (Math.min(...candidates.map(value => value.getTime())) - operation.getTime()) / 86400000 : null;
}
export function summarize(cases: AnalysisCase[]) {
  // One observation per case for these summaries. Repeated PROMs are not pooled as independent patients.
  const bmis = cases.map(item => { const value = number(item.patient.bmi); return value !== null && value >= 5 && value <= 100 ? value : null; });
  const proms = cases.flatMap(item => item.proms);
  return { count: cases.length, age: descriptive(cases.map(item => age(item.patient))), bmi: descriptive(bmis),
    healing: descriptive(cases.map(healing)), procedures: distribution(cases.map(item => item.patient.operationTechnique)),
    sex: distribution(cases.map(item => typeof item.patient.sex === 'string' ? item.patient.sex.toLowerCase() : null)),
    furtherSurgeries: cases.reduce((total, item) => total + item.surgeries.length, 0),
    followups: cases.reduce((total, item) => total + item.followups.length, 0),
    promRecords: proms.length, legacyPromRecords: proms.filter(item => item.promSchemaVersion !== 2).length,
    answeredPainToday: proms.filter(item => item.promSchemaVersion === 2 && number(item.painToday) !== null).length };
}
