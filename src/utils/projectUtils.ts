import { ActionItem, RiskItem, DecisionItem, RAGAssessment, RAGColor, ProjectState } from '../types';

export function calculateScore(probability: number, impact: number): number {
  return Math.min(25, Math.max(1, probability * impact));
}

export function getScoreColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 15) {
    return { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', label: 'High (15-25)' };
  }
  if (score >= 8) {
    return { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', label: 'Medium (8-12)' };
  }
  return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', label: 'Low (1-6)' };
}

export function isOverdue(dueDate: string | null, referenceDate: string, status: string): boolean {
  if (!dueDate || status === 'Completed') return false;
  return dueDate < referenceDate;
}

export function isDueSoon(dueDate: string | null, referenceDate: string, status: string): boolean {
  if (!dueDate || status === 'Completed') return false;
  if (dueDate < referenceDate) return false;
  
  const ref = new Date(referenceDate);
  const target = new Date(dueDate);
  const diffTime = target.getTime() - ref.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
}

export function calculateRAGStatus(
  actions: ActionItem[],
  risks: RiskItem[],
  referenceDate: string
): { calculatedStatus: RAGColor; triggeredRules: string[]; reason: string } {
  const triggeredRules: string[] = [];

  // 1. Check RED conditions
  const openBlockers = risks.filter((r) => r.category === 'Blocker' && r.status !== 'Resolved');
  if (openBlockers.length > 0) {
    triggeredRules.push(
      `Active Blocker: ${openBlockers.length} unresolved blocker item(s) halting execution (${openBlockers.map((b) => b.id).join(', ')}).`
    );
  }

  const highImpactIssues = risks.filter(
    (r) => r.category === 'Issue' && r.impact >= 4 && r.status !== 'Resolved'
  );
  if (highImpactIssues.length > 0) {
    triggeredRules.push(
      `High Impact Realized Issue: ${highImpactIssues.length} unresolved issue(s) with impact >= 4 (${highImpactIssues.map((i) => i.id).join(', ')}).`
    );
  }

  const nonCompletedActions = actions.filter((a) => a.status !== 'Completed');
  const overdueActions = actions.filter((a) => isOverdue(a.dueDate, referenceDate, a.status));
  if (nonCompletedActions.length > 0) {
    const overdueRatio = overdueActions.length / nonCompletedActions.length;
    if (overdueRatio > 0.2) {
      const pct = Math.round(overdueRatio * 100);
      triggeredRules.push(
        `Critical Schedule Slippage: ${pct}% of active actions are overdue (${overdueActions.length}/${nonCompletedActions.length}), exceeding 20% threshold.`
      );
    }
  }

  if (triggeredRules.length > 0) {
    return {
      calculatedStatus: 'RED',
      triggeredRules,
      reason: triggeredRules[0],
    };
  }

  // 2. Check AMBER conditions
  if (overdueActions.length > 0) {
    triggeredRules.push(
      `Schedule Warning: ${overdueActions.length} action(s) are past due reference date (${overdueActions.map((a) => a.id).join(', ')}).`
    );
  }

  const highRisks = risks.filter(
    (r) => r.category === 'Risk' && r.score >= 15 && r.status !== 'Resolved'
  );
  if (highRisks.length > 0) {
    triggeredRules.push(
      `High Risk Exposure: ${highRisks.length} risk(s) scored >= 15 (${highRisks.map((r) => `${r.id} [${r.score}]`).join(', ')}).`
    );
  }

  if (triggeredRules.length > 0) {
    return {
      calculatedStatus: 'AMBER',
      triggeredRules,
      reason: triggeredRules[0],
    };
  }

  // 3. GREEN
  return {
    calculatedStatus: 'GREEN',
    triggeredRules: [
      'Nominal Operation: No open blockers, zero overdue actions, and all active risks are mitigated below threshold (Score < 15).',
    ],
    reason: 'Project trajectory nominal. Zero active blockers, and no overdue commitments.',
  };
}

export function generateNextId(prefix: 'ACT' | 'RSK' | 'DEC', existingIds: string[]): string {
  let maxNum = 0;
  for (const id of existingIds) {
    if (id.startsWith(prefix)) {
      const numPart = parseInt(id.replace(`${prefix}-`, ''), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  const nextNum = maxNum + 1;
  return `${prefix}-${String(nextNum).padStart(3, '0')}`;
}

export function exportActionsToCSV(actions: ActionItem[]): void {
  const headers = ['ID', 'Title', 'Owner', 'Due Date', 'Status', 'Dependencies', 'Epistemic Status', 'Validation Notes', 'Source Quote', 'Updated At'];
  const rows = actions.map((a) => [
    a.id,
    `"${(a.title || '').replace(/"/g, '""')}"`,
    `"${(a.owner || 'Unassigned').replace(/"/g, '""')}"`,
    a.dueDate || 'Unset',
    a.status,
    `"${(a.dependencies || '').replace(/"/g, '""')}"`,
    a.epistemicStatus,
    `"${(a.validationNotes || '').replace(/"/g, '""')}"`,
    `"${(a.sourceQuote || '').replace(/"/g, '""')}"`,
    a.updatedAt,
  ]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, 'project_action_tracker.csv', 'text/csv;charset=utf-8;');
}

export function exportRisksToCSV(risks: RiskItem[]): void {
  const headers = ['ID', 'Category', 'Description', 'Owner', 'Probability', 'Impact', 'Score', 'Strategy', 'Mitigation Plan', 'AI Proposed', 'Status', 'Epistemic Status', 'Source Quote'];
  const rows = risks.map((r) => [
    r.id,
    r.category,
    `"${(r.description || '').replace(/"/g, '""')}"`,
    `"${(r.owner || 'Unassigned').replace(/"/g, '""')}"`,
    r.probability,
    r.impact,
    r.score,
    r.strategy,
    `"${(r.mitigationPlan || '').replace(/"/g, '""')}"`,
    r.isMitigationAIProposed ? 'Yes' : 'No',
    r.status,
    r.epistemicStatus,
    `"${(r.sourceQuote || '').replace(/"/g, '""')}"`,
  ]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  downloadBlob(csvContent, 'project_risk_register_iso31000.csv', 'text/csv;charset=utf-8;');
}

export function generateMarkdownReport(state: ProjectState): string {
  const { projectName, projectDescription, referenceDate, actions, risks, decisions, ragAssessment, executiveSummary } = state;

  const totalActions = actions.length;
  const completed = actions.filter((a) => a.status === 'Completed').length;
  const overdue = actions.filter((a) => isOverdue(a.dueDate, referenceDate, a.status));
  const blockers = risks.filter((r) => r.category === 'Blocker' && r.status !== 'Resolved');
  const openIssues = risks.filter((r) => r.category === 'Issue' && r.status !== 'Resolved');
  const highRisks = risks.filter((r) => r.category === 'Risk' && r.score >= 15 && r.status !== 'Resolved');
  const clarifications = actions.filter((a) => a.epistemicStatus === 'Needs Clarification');

  return `# ${projectName} — Weekly Project Status Report
**Reference Evaluation Date:** ${referenceDate}  
**Deterministic Governance RAG:** **${ragAssessment.status}**  
${ragAssessment.isManualOverride ? `*(Manual Override by PM: ${ragAssessment.overrideJustification || 'No justification provided'} | Calculated: ${ragAssessment.calculatedStatus})*` : `*(Rule Triggered: ${ragAssessment.reason})*`}

---

## 1. Executive Summary
${executiveSummary || 'No executive summary generated yet. Run AI Executive Summary generation in the workspace.'}

---

## 2. Key Decisions Logged (${decisions.length})
${decisions.length === 0 ? '_No official decisions logged._' : decisions.map((d) => `- **[${d.id}]** ${d.decision} *(Recorded: ${d.dateRecorded})*\n  > Source Quote: "${d.sourceQuote}"`).join('\n')}

---

## 3. Active Blockers & High Severity Risks
### Active Blockers (${blockers.length})
${blockers.length === 0 ? '_Zero active blockers._' : blockers.map((b) => `- **[${b.id}]** ${b.description} (Owner: ${b.owner || 'Unassigned'})\n  - **Mitigation:** ${b.mitigationPlan}`).join('\n')}

### Realized Issues (${openIssues.length})
${openIssues.length === 0 ? '_Zero active issues._' : openIssues.map((i) => `- **[${i.id}]** ${i.description} (Impact: ${i.impact}/5, Owner: ${i.owner || 'Unassigned'})\n  - **Plan:** ${i.mitigationPlan}`).join('\n')}

### High Risks (ISO 31000 Score >= 15) (${highRisks.length})
${highRisks.length === 0 ? '_Zero high-severity risks._' : highRisks.map((r) => `- **[${r.id}]** ${r.description} (P:${r.probability} × I:${r.impact} = **${r.score}**, Strategy: ${r.strategy})\n  - **Mitigation:** ${r.mitigationPlan}`).join('\n')}

---

## 4. Action Tracker Overview
- **Total Actions:** ${totalActions}
- **Completed:** ${completed} (${totalActions ? Math.round((completed / totalActions) * 100) : 0}%)
- **Overdue Actions:** ${overdue.length}

${overdue.length > 0 ? '### Overdue Items\n' + overdue.map((o) => `- ⚠️ **[${o.id}]** ${o.title} — Due: ${o.dueDate} (Owner: ${o.owner || 'Unassigned'})`).join('\n') : ''}

---

## 5. Items Requiring Clarification (${clarifications.length})
${clarifications.length === 0 ? '_All items have confirmed owners and definitive dates._' : clarifications.map((c) => `- **[${c.id}]** ${c.title}\n  - **Reason:** ${c.validationNotes || 'Missing required governance attribution'}\n  - **Source Quote:** "${c.sourceQuote}"`).join('\n')}
`;
}

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
