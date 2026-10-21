import type { Assessment, Evidence, TraceResponse } from '../types';

export interface TraceSummary {
  ata_chapter?: string;
  finding?: string;
  proposed_department?: string;
  retry_count: number;
  evidence: Evidence[];
  reached: Set<Assessment['stage']>;
}

/**
 * /requests/{id}/trace의 assessments(단계별 AI 출력 원본)를 상세 화면용으로 요약합니다.
 * 같은 단계가 여러 번이면(재조사) 마지막 attempt를 씁니다.
 */
export function summarizeTrace(trace: TraceResponse): TraceSummary {
  const latest = (stage: Assessment['stage']) =>
    trace.assessments.filter(a => a.stage === stage).sort((a, b) => a.attempt - b.attempt).at(-1)?.output ?? undefined;
  const classification = latest('CLASSIFYING');
  const investigation = latest('INVESTIGATING');
  const final = latest('FINAL');
  const investigateAttempts = trace.assessments.filter(a => a.stage === 'INVESTIGATING').map(a => a.attempt);
  return {
    ata_chapter: investigation?.ata_chapter ?? classification?.ata_chapter,
    finding: final?.summary ?? investigation?.finding ?? classification?.rationale,
    proposed_department: final?.department ?? investigation?.proposed_department ?? classification?.proposed_department,
    retry_count: investigateAttempts.length ? Math.max(...investigateAttempts) - 1 : 0,
    evidence: (final?.evidence ?? investigation?.evidence ?? []) as Evidence[],
    reached: new Set(trace.assessments.map(a => a.stage))
  };
}
