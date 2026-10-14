// Copyright (c) 2026 Cesar Herrera.
// All rights reserved.
// This code is provided for portfolio demonstration purposes.

export type ActionStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Completed';

export type EpistemicStatus = 'Confirmed' | 'AI Suggestion' | 'Needs Clarification';

export type RiskCategory = 'Risk' | 'Issue' | 'Blocker';

export type RiskStrategy = 'Avoid' | 'Mitigate' | 'Transfer' | 'Accept' | 'Escalate';

export type RiskFramework = 'PMI' | 'ISO31000';

export interface ActionItem {
  id: string;
  title: string;
  owner: string | null;
  dueDate: string | null;
  status: ActionStatus;
  dependencies: string;
  epistemicStatus: EpistemicStatus;
  validationNotes: string | null;
  sourceQuote: string;
  updatedAt: string;
}

export interface RiskItem {
  id: string;
  category: RiskCategory;
  description: string;
  owner: string | null;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  score: number;
  strategy: RiskStrategy;
  mitigationPlan: string;
  isMitigationAIProposed: boolean;
  status: 'Open' | 'Monitoring' | 'Resolved';
  epistemicStatus: EpistemicStatus;
  sourceQuote: string;
}

export interface DecisionItem {
  id: string;
  decision: string;
  dateRecorded: string;
  sourceQuote: string;
}

export interface ProposedActionUpdate {
  targetActionId: string;
  proposedStatus?: ActionStatus;
  proposedDueDate?: string;
  proposedOwner?: string;
  reasonAndQuote: string;
}

export interface ProposedRiskUpdate {
  targetRiskId: string;
  proposedStatus: 'Open' | 'Monitoring' | 'Resolved';
  reasonAndQuote: string;
}

export interface StagingExtractionResult {
  isSufficientInput: boolean;
  insufficiencyReason: string | null;
  ambiguitiesAndContradictions: string[];
  newActions: Omit<ActionItem, 'id' | 'updatedAt'>[];
  proposedActionUpdates: ProposedActionUpdate[];
  newRisksAndIssues: Omit<RiskItem, 'id' | 'score'>[];
  proposedRiskUpdates: ProposedRiskUpdate[];
  extractedDecisions: Omit<DecisionItem, 'id' | 'dateRecorded'>[];
}

export type RAGColor = 'RED' | 'AMBER' | 'GREEN';

export interface RAGAssessment {
  status: RAGColor;
  calculatedStatus: RAGColor;
  reason: string;
  triggeredRules: string[];
  isManualOverride: boolean;
  overrideJustification?: string;
}

export interface ProjectState {
  projectName: string;
  projectDescription: string;
  referenceDate: string;
  riskFramework: RiskFramework;
  actions: ActionItem[];
  risks: RiskItem[];
  decisions: DecisionItem[];
  ragAssessment: RAGAssessment;
  executiveSummary: string | null;
  lastAnalysisTimestamp: string | null;
}

export interface ProjectSnapshot {
  version: string;
  timestamp: string;
  changeNote: string;
  data: {
    actions: ActionItem[];
    risks: RiskItem[];
    decisions: DecisionItem[];
  };
}

export type Language = 'en' | 'es' | 'fr';

export interface StagingSnapshot {
  extractionResult: StagingExtractionResult;
  stagingNewActions: Omit<ActionItem, 'id' | 'updatedAt'>[];
  stagingNewRisks: Omit<RiskItem, 'id' | 'score'>[];
  stagingDecisions: Omit<DecisionItem, 'id' | 'dateRecorded'>[];
  stagingActionUpdates: ProposedActionUpdate[];
  stagingRiskUpdates: ProposedRiskUpdate[];
  selectedActionUpdates: Record<number, boolean>;
  selectedRiskUpdates: Record<number, boolean>;
  selectedNewActions: Record<number, boolean>;
  selectedNewRisks: Record<number, boolean>;
  selectedDecisions: Record<number, boolean>;
}
