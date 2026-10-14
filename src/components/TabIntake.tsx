import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  FileText,
  Layers,
  CheckSquare,
  Square,
  RefreshCw,
  PlusCircle,
  Shield,
  Trash2,
} from 'lucide-react';
import {
  ActionItem,
  RiskItem,
  DecisionItem,
  StagingExtractionResult,
  ProposedActionUpdate,
  ProposedRiskUpdate,
  EpistemicStatus,
  RiskCategory,
  Language,
  StagingSnapshot,
} from '../types';
import { extractProjectUpdates } from '../services/geminiService';
import { generateNextId, calculateScore } from '../utils/projectUtils';

interface TabIntakeProps {
  referenceDate: string;
  currentActions: ActionItem[];
  currentRisks: RiskItem[];
  currentDecisions: DecisionItem[];
  initialNotes?: string;
  language?: Language;
  onCommitUpdates: (
    committed: {
      actionsToAdd: ActionItem[];
      actionUpdatesToApply: { id: string; updates: Partial<ActionItem> }[];
      risksToAdd: RiskItem[];
      riskUpdatesToApply: { id: string; updates: Partial<RiskItem> }[];
      decisionsToAdd: DecisionItem[];
    },
    stagingSnapshot?: StagingSnapshot
  ) => void;
  restoredStaging?: StagingSnapshot | null;
}

export const TabIntake: React.FC<TabIntakeProps> = ({
  referenceDate,
  currentActions,
  currentRisks,
  currentDecisions,
  initialNotes = '',
  language = 'en',
  onCommitUpdates,
  restoredStaging,
}) => {
  const [meetingNotes, setMeetingNotes] = useState(initialNotes);
  const [isExtracting, setIsExtracting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [extractionResult, setExtractionResult] = useState<StagingExtractionResult | null>(null);
  const [extractionTimestamp, setExtractionTimestamp] = useState<string | null>(null);
  const [isConfidentialityConfirmed, setIsConfidentialityConfirmed] = useState(false);

  // Sync external initial notes changes
  useEffect(() => {
    setMeetingNotes(initialNotes);
  }, [initialNotes]);

  // Restore staging gate if Undo was triggered
  useEffect(() => {
    if (restoredStaging) {
      setExtractionResult(restoredStaging.extractionResult);
      setStagingNewActions(restoredStaging.stagingNewActions);
      setStagingNewRisks(restoredStaging.stagingNewRisks);
      setStagingDecisions(restoredStaging.stagingDecisions);
      setStagingActionUpdates(restoredStaging.stagingActionUpdates);
      setStagingRiskUpdates(restoredStaging.stagingRiskUpdates);
      setSelectedActionUpdates(restoredStaging.selectedActionUpdates);
      setSelectedRiskUpdates(restoredStaging.selectedRiskUpdates);
      setSelectedNewActions(restoredStaging.selectedNewActions);
      setSelectedNewRisks(restoredStaging.selectedNewRisks);
      setSelectedDecisions(restoredStaging.selectedDecisions);
    }
  }, [restoredStaging]);

  // Staging selection states
  const [selectedActionUpdates, setSelectedActionUpdates] = useState<Record<number, boolean>>({});
  const [selectedRiskUpdates, setSelectedRiskUpdates] = useState<Record<number, boolean>>({});
  const [selectedNewActions, setSelectedNewActions] = useState<Record<number, boolean>>({});
  const [selectedNewRisks, setSelectedNewRisks] = useState<Record<number, boolean>>({});
  const [selectedDecisions, setSelectedDecisions] = useState<Record<number, boolean>>({});

  // Editable staging states
  const [stagingNewActions, setStagingNewActions] = useState<Omit<ActionItem, 'id' | 'updatedAt'>[]>([]);
  const [stagingNewRisks, setStagingNewRisks] = useState<Omit<RiskItem, 'id' | 'score'>[]>([]);
  const [stagingDecisions, setStagingDecisions] = useState<Omit<DecisionItem, 'id' | 'dateRecorded'>[]>([]);
  const [stagingActionUpdates, setStagingActionUpdates] = useState<ProposedActionUpdate[]>([]);
  const [stagingRiskUpdates, setStagingRiskUpdates] = useState<ProposedRiskUpdate[]>([]);

  const handleAnalyze = async () => {
    if (!meetingNotes.trim()) return;
    setIsExtracting(true);
    setApiError(null);
    try {
      const result = await extractProjectUpdates(
        meetingNotes,
        referenceDate,
        currentActions,
        currentRisks,
        language
      );
      setExtractionResult(result);
      setExtractionTimestamp(new Date().toLocaleTimeString());
      setIsConfidentialityConfirmed(false); // Uncheck automatically after every successful extraction

      // Populate staging editable data
      setStagingNewActions(result.newActions);
      setStagingNewRisks(result.newRisksAndIssues);
      setStagingDecisions(result.extractedDecisions);
      setStagingActionUpdates(result.proposedActionUpdates);
      setStagingRiskUpdates(result.proposedRiskUpdates);

      // Select all by default
      const actUpdMap: Record<number, boolean> = {};
      result.proposedActionUpdates.forEach((_, i) => (actUpdMap[i] = true));
      setSelectedActionUpdates(actUpdMap);

      const rskUpdMap: Record<number, boolean> = {};
      result.proposedRiskUpdates.forEach((_, i) => (rskUpdMap[i] = true));
      setSelectedRiskUpdates(rskUpdMap);

      const newActMap: Record<number, boolean> = {};
      result.newActions.forEach((_, i) => (newActMap[i] = true));
      setSelectedNewActions(newActMap);

      const newRskMap: Record<number, boolean> = {};
      result.newRisksAndIssues.forEach((_, i) => (newRskMap[i] = true));
      setSelectedNewRisks(newRskMap);

      const decMap: Record<number, boolean> = {};
      result.extractedDecisions.forEach((_, i) => (decMap[i] = true));
      setSelectedDecisions(decMap);
    } catch (error: any) {
      console.error('Failed to extract updates:', error);
      const msg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      setApiError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCommit = () => {
    if (!extractionResult) return;

    const existingActionIds = currentActions.map((a) => a.id);
    const existingRiskIds = currentRisks.map((r) => r.id);
    const existingDecisionIds = currentDecisions.map((d) => d.id);

    // 1. New Actions
    const actionsToAdd: ActionItem[] = [];
    stagingNewActions.forEach((item, index) => {
      if (selectedNewActions[index]) {
        const nextId = generateNextId('ACT', [...existingActionIds, ...actionsToAdd.map((a) => a.id)]);
        actionsToAdd.push({
          id: nextId,
          ...item,
          updatedAt: referenceDate,
        });
      }
    });

    // 2. Action Updates
    const actionUpdatesToApply: { id: string; updates: Partial<ActionItem> }[] = [];
    stagingActionUpdates.forEach((update, index) => {
      if (selectedActionUpdates[index]) {
        const updates: Partial<ActionItem> = {
          updatedAt: referenceDate,
        };
        if (update.proposedStatus) updates.status = update.proposedStatus;
        if (update.proposedDueDate) updates.dueDate = update.proposedDueDate;
        if (update.proposedOwner) updates.owner = update.proposedOwner;
        actionUpdatesToApply.push({
          id: update.targetActionId,
          updates,
        });
      }
    });

    // 3. New Risks
    const risksToAdd: RiskItem[] = [];
    stagingNewRisks.forEach((risk, index) => {
      if (selectedNewRisks[index]) {
        const nextId = generateNextId('RSK', [...existingRiskIds, ...risksToAdd.map((r) => r.id)]);
        const score = calculateScore(risk.probability, risk.impact);
        risksToAdd.push({
          id: nextId,
          ...risk,
          score,
        });
      }
    });

    // 4. Risk Updates
    const riskUpdatesToApply: { id: string; updates: Partial<RiskItem> }[] = [];
    stagingRiskUpdates.forEach((update, index) => {
      if (selectedRiskUpdates[index]) {
        riskUpdatesToApply.push({
          id: update.targetRiskId,
          updates: {
            status: update.proposedStatus,
          },
        });
      }
    });

    // 5. Extracted Decisions
    const decisionsToAdd: DecisionItem[] = [];
    stagingDecisions.forEach((dec, index) => {
      if (selectedDecisions[index]) {
        const nextId = generateNextId('DEC', [...existingDecisionIds, ...decisionsToAdd.map((d) => d.id)]);
        decisionsToAdd.push({
          id: nextId,
          decision: dec.decision,
          dateRecorded: referenceDate,
          sourceQuote: dec.sourceQuote,
        });
      }
    });

    const stagingSnapshot: StagingSnapshot = {
      extractionResult,
      stagingNewActions: [...stagingNewActions],
      stagingNewRisks: [...stagingNewRisks],
      stagingDecisions: [...stagingDecisions],
      stagingActionUpdates: [...stagingActionUpdates],
      stagingRiskUpdates: [...stagingRiskUpdates],
      selectedActionUpdates: { ...selectedActionUpdates },
      selectedRiskUpdates: { ...selectedRiskUpdates },
      selectedNewActions: { ...selectedNewActions },
      selectedNewRisks: { ...selectedNewRisks },
      selectedDecisions: { ...selectedDecisions },
    };

    onCommitUpdates(
      {
        actionsToAdd,
        actionUpdatesToApply,
        risksToAdd,
        riskUpdatesToApply,
        decisionsToAdd,
      },
      stagingSnapshot
    );

    // Clear staging result after commit
    setExtractionResult(null);
  };

  const intakeDict = {
    en: {
      title: 'Meeting Minutes & Site Log Intake',
      subtitle: 'Paste raw notes, minutes, or transcript excerpts. The AI validates task owners, dates, ISO 31000 risks, and flags contradictions.',
      contextRegister: 'Context Register:',
      actions: 'Actions',
      risks: 'Risks',
      placeholder: "Paste meeting notes here... (e.g. 'Carlos confirmed CAD layout deadline is 2026-10-16. Someone must verify concrete slab...')",
      tooLong: 'Input exceeds maximum safe context length. Please split notes into smaller segments.',
      tooShort: 'Input too short for reliable extraction.',
      safeContext: 'Safe context window. Unassigned owners or vague deadlines ("ASAP") are strictly flagged as Needs Clarification.',
      characters: 'characters',
      confidentialityCheck: 'I confirm these notes contain no strict confidential PII, exact financial bids, or classified security data.',
      analyzing: 'Analyzing & Diffing...',
      analyzeBtn: 'Analyze & Extract',
      stagingTitle: 'Staging & Validation Gate',
      stagingSubtitle: 'Zero-Trust Ingestion: Nothing reaches the live registers until you review and commit.',
      analyzedAt: 'Analyzed at',
      commitBtn: 'Commit Selected to Project Registers',
      insufficientTitle: 'Insufficient Input Detected',
      contradictionsTitle: 'Critical Schedule Contradictions & Ambiguities Flagged',
      proposedActionUpdates: 'Proposed Updates to Existing Actions',
      matchedDiffing: 'matched via context-aware diffing',
      currentValue: 'Current Value',
      proposedValue: 'Proposed Value',
      statusLabel: 'Status:',
      rationaleQuote: 'Rationale & Quote:',
      proposedRiskUpdates: 'Proposed Updates to Existing Risks',
      currentStatus: 'Current Status',
      proposedStatus: 'Proposed Status',
      reason: 'Reason:',
      newActionsTitle: 'New Action Items Proposed',
      editableNotice: 'Editable before commit',
      colSelect: 'Select',
      colTitle: 'Title & Deliverable',
      colOwner: 'Owner',
      colDueDate: 'Due Date',
      colStatus: 'Status',
      colEpistemic: 'Epistemic Status',
      colRationale: 'Validation Rationale',
      unassigned: 'Unassigned (null)',
      newRisksTitle: 'New Risks, Issues & Blockers Proposed',
      colCategory: 'Category',
      colDescription: 'Description',
      colProb: 'Prob (1-5)',
      colImpact: 'Impact (1-5)',
      colScore: 'Score',
      colStrategy: 'Strategy & Mitigation',
      colAiMitigation: 'AI Mitigation',
      aiProposed: 'AI Proposed',
      decisionsTitle: 'Ratified Decisions Extracted',
      sourceQuote: 'Source Quote:',
      bottomNotice: 'Review completed? Clicking "Commit Selected" writes changes into persistent registers.',
      confirmedBadge: 'Confirmed',
      needsClarificationBadge: 'Needs Clarification',
      aiSuggestionBadge: 'AI Suggestion',
      riskBadge: 'Risk',
      issueBadge: 'Issue',
      blockerBadge: 'Blocker',
      optNotStarted: 'Not Started',
      optInProgress: 'In Progress',
      optBlocked: 'Blocked',
      optCompleted: 'Completed',
    },
    es: {
      title: 'Recepción de Minutas y Registros de Obra',
      subtitle: 'Pegue notas sin estructurar o minutas. La IA valida responsables, fechas, riesgos y marca contradicciones.',
      contextRegister: 'Registro de Contexto:',
      actions: 'Acciones',
      risks: 'Riesgos',
      placeholder: "Pegue las notas de reunión aquí... (ej. 'Carlos confirmó fecha límite de planos CAD el 2026-10-16. Alguien debe verificar la losa...')",
      tooLong: 'El texto supera la longitud máxima segura de contexto. Divida las notas en segmentos más pequeños.',
      tooShort: 'El texto es demasiado corto para una extracción confiable.',
      safeContext: 'Ventana de contexto segura. Responsables o fechas ausentes se marcarán como Requiere Aclaración.',
      characters: 'caracteres',
      confidentialityCheck: 'Confirmo que estas notas no contienen datos personales confidenciales (PII), ofertas financieras exactas ni datos clasificados de seguridad.',
      analyzing: 'Analizando y Cotejando...',
      analyzeBtn: 'Analizar y Extraer',
      stagingTitle: 'Compuerta de Validación y Aprobación',
      stagingSubtitle: 'Ingreso con Cero Confianza: Nada ingresa a los registros activos hasta su revisión y confirmación.',
      analyzedAt: 'Analizado a las',
      commitBtn: 'Confirmar Elementos Seleccionados en Registros',
      insufficientTitle: 'Entrada Insuficiente Detectada',
      contradictionsTitle: 'Contradicciones de Cronograma y Ambigüedades Críticas Detectadas',
      proposedActionUpdates: 'Actualizaciones Propuestas para Acciones Existentes',
      matchedDiffing: 'cotejado mediante análisis contextual de diferencias',
      currentValue: 'Valor Actual',
      proposedValue: 'Valor Propuesto',
      statusLabel: 'Estado:',
      rationaleQuote: 'Justificación y Cita:',
      proposedRiskUpdates: 'Actualizaciones Propuestas para Riesgos Existentes',
      currentStatus: 'Estado Actual',
      proposedStatus: 'Estado Propuesto',
      reason: 'Motivo:',
      newActionsTitle: 'Nuevas Acciones Propuestas',
      editableNotice: 'Editable antes de confirmar',
      colSelect: 'Seleccionar',
      colTitle: 'Título y Entregable',
      colOwner: 'Responsable',
      colDueDate: 'Fecha Límite',
      colStatus: 'Estado',
      colEpistemic: 'Certeza Epistémica',
      colRationale: 'Justificación de Validación',
      unassigned: 'Sin asignar (null)',
      newRisksTitle: 'Nuevos Riesgos, Problemas y Bloqueos Propuestos',
      colCategory: 'Categoría',
      colDescription: 'Descripción',
      colProb: 'Prob (1-5)',
      colImpact: 'Impacto (1-5)',
      colScore: 'Puntaje',
      colStrategy: 'Estrategia y Mitigación',
      colAiMitigation: 'Mitigación IA',
      aiProposed: 'Propuesto por IA',
      decisionsTitle: 'Decisiones Ratificadas Extraídas',
      sourceQuote: 'Cita Textual:',
      bottomNotice: '¿Revisión completada? Al hacer clic en "Confirmar Elementos Seleccionados" se guardan los cambios en los registros permanentes.',
      confirmedBadge: 'Confirmado',
      needsClarificationBadge: 'Requiere Aclaración',
      aiSuggestionBadge: 'Sugerencia IA',
      riskBadge: 'Riesgo',
      issueBadge: 'Problema',
      blockerBadge: 'Bloqueo',
      optNotStarted: 'No Iniciada',
      optInProgress: 'En Progreso',
      optBlocked: 'Bloqueada',
      optCompleted: 'Completada',
    },
    fr: {
      title: 'Réception des Comptes-rendus et Journaux de Chantier',
      subtitle: 'Collez les notes brutes ou comptes-rendus. L\'IA valide les responsables, dates, risques et signale les contradictions.',
      contextRegister: 'Registre de Contexte :',
      actions: 'Actions',
      risks: 'Risques',
      placeholder: "Collez les notes de réunion ici... (ex. 'Carlos a confirmé la date limite des plans CAO au 2026-10-16. Quelqu'un doit vérifier la dalle...')",
      tooLong: 'Le texte dépasse la longueur maximale sécurisée de contexte. Veuillez diviser les notes en segments plus petits.',
      tooShort: 'Le texte est trop court pour une extraction fiable.',
      safeContext: 'Fenêtre de contexte sécurisée. Les responsables ou dates manquants sont marqués Nécessite Clarification.',
      characters: 'caractères',
      confidentialityCheck: 'Je confirme que ces notes ne contiennent aucune donnée personnelle identifiable (PII), offre financière exacte ni information de sécurité classifiée.',
      analyzing: 'Analyse et Comparaison...',
      analyzeBtn: 'Analyser et Extraire',
      stagingTitle: 'Porte de Validation et d\'Approbation',
      stagingSubtitle: 'Ingestion Zéro Confiance : Rien n\'atteint les registres actifs avant votre révision et confirmation.',
      analyzedAt: 'Analysé à',
      commitBtn: 'Confirmer les Éléments Sélectionnés dans les Registres',
      insufficientTitle: 'Entrée Insuffisante Détectée',
      contradictionsTitle: 'Contradictions de Calendrier et Ambiguïtés Critiques Signalées',
      proposedActionUpdates: 'Mises à Jour Proposées pour les Actions Existantes',
      matchedDiffing: 'comparé par analyse contextuelle des écarts',
      currentValue: 'Valeur Actuelle',
      proposedValue: 'Valeur Proposée',
      statusLabel: 'Statut :',
      rationaleQuote: 'Justification et Citation :',
      proposedRiskUpdates: 'Mises à Jour Proposées pour les Risques Existants',
      currentStatus: 'Statut Actuel',
      proposedStatus: 'Statut Proposé',
      reason: 'Motif :',
      newActionsTitle: 'Nouvelles Actions Proposées',
      editableNotice: 'Modifiable avant confirmation',
      colSelect: 'Sélectionner',
      colTitle: 'Titre et Livrable',
      colOwner: 'Responsable',
      colDueDate: 'Date Limite',
      colStatus: 'Statut',
      colEpistemic: 'Certitude Épistémique',
      colRationale: 'Justification de Validation',
      unassigned: 'Non assigné (null)',
      newRisksTitle: 'Nouveaux Risques, Problèmes et Blocages Proposés',
      colCategory: 'Catégorie',
      colDescription: 'Description',
      colProb: 'Prob (1-5)',
      colImpact: 'Impact (1-5)',
      colScore: 'Score',
      colStrategy: 'Stratégie et Atténuation',
      colAiMitigation: 'Atténuation IA',
      aiProposed: 'Proposé par IA',
      decisionsTitle: 'Décisions Ratifiées Extraites',
      sourceQuote: 'Citation Source :',
      bottomNotice: 'Révision terminée ? Cliquer sur « Confirmer les éléments sélectionnés » enregistre les modifications dans les registres permanents.',
      confirmedBadge: 'Confirmé',
      needsClarificationBadge: 'Nécessite Clarification',
      aiSuggestionBadge: 'Suggestion IA',
      riskBadge: 'Risque',
      issueBadge: 'Problème',
      blockerBadge: 'Blocage',
      optNotStarted: 'Non Commencée',
      optInProgress: 'En Cours',
      optBlocked: 'Bloquée',
      optCompleted: 'Terminée',
    },
  }[language];

  const getEpistemicBadge = (status: EpistemicStatus) => {
    switch (status) {
      case 'Confirmed':
        return <span className="text-emerald-700 bg-emerald-50 text-[11px] px-2 py-0.5 rounded font-medium">{intakeDict.confirmedBadge}</span>;
      case 'Needs Clarification':
        return <span className="text-amber-700 bg-amber-50 text-[11px] px-2 py-0.5 rounded font-medium">{intakeDict.needsClarificationBadge}</span>;
      case 'AI Suggestion':
        return <span className="text-blue-700 bg-blue-50 text-[11px] px-2 py-0.5 rounded font-medium">{intakeDict.aiSuggestionBadge}</span>;
    }
  };

  const getCategoryBadge = (cat: RiskCategory) => {
    switch (cat) {
      case 'Blocker':
        return <span className="text-rose-700 bg-rose-50 text-[11px] px-2 py-0.5 rounded font-semibold">{intakeDict.blockerBadge}</span>;
      case 'Issue':
        return <span className="text-orange-700 bg-orange-50 text-[11px] px-2 py-0.5 rounded font-semibold">{intakeDict.issueBadge}</span>;
      case 'Risk':
        return <span className="text-blue-700 bg-blue-50 text-[11px] px-2 py-0.5 rounded font-semibold">{intakeDict.riskBadge}</span>;
    }
  };

  const charCount = meetingNotes.length;
  const isTooLong = charCount > 15000;
  const isTooShort = charCount < 50;
  const isAnalyzeDisabled = isExtracting || isTooShort || isTooLong || !isConfidentialityConfirmed;

  return (
    <div className="space-y-8">
      {/* SECTION 1: Intake & Raw Meeting Notes */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              {intakeDict.title}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {intakeDict.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>{intakeDict.contextRegister}</span>
            <span className="text-slate-800 font-semibold">{currentActions.length} {intakeDict.actions}</span>
            <span>·</span>
            <span className="text-slate-800 font-semibold">{currentRisks.length} {intakeDict.risks}</span>
          </div>
        </div>

        {/* Real Error Banner displaying error.message */}
        {apiError && (
          <div className="mb-4 p-4 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-rose-950">Gemini API Error</h4>
                <p className="font-mono text-[11px] text-rose-900 bg-rose-100/70 p-2.5 rounded border border-rose-200 break-all leading-relaxed">
                  {apiError}
                </p>
                <p className="text-[11px] text-rose-700">
                  Target model: <code className="font-mono font-semibold">gemini-flash-latest</code>. Inspect the error message above for details.
                </p>
              </div>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-rose-400 hover:text-rose-700 font-bold p-1 text-sm"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <textarea
          value={meetingNotes}
          onChange={(e) => setMeetingNotes(e.target.value)}
          rows={7}
          placeholder={intakeDict.placeholder}
          className="w-full font-mono text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all leading-relaxed"
        />

        {/* Guardrail 1: Input Length Guardrail (Token Management) */}
        <div className="flex flex-wrap items-center justify-between text-xs mt-2 gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-[280px]">
            {isTooLong && (
              <span className="text-rose-600 font-semibold flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                {intakeDict.tooLong}
              </span>
            )}
            {isTooShort && (
              <span className="text-amber-700 font-medium flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                {intakeDict.tooShort}
              </span>
            )}
            {!isTooLong && !isTooShort && (
              <span className="text-slate-500 text-[11px]">
                {intakeDict.safeContext}
              </span>
            )}
          </div>

          <div
            className={`font-mono text-xs tabular-nums px-2.5 py-1 rounded border transition-colors ${
              isTooLong
                ? 'text-rose-600 font-bold bg-rose-50 border-rose-300'
                : 'text-slate-600 bg-slate-100 border-slate-200'
            }`}
          >
            {charCount.toLocaleString()} / 15,000 {intakeDict.characters}
          </div>
        </div>

        {/* Guardrail 2: Confidentiality Pre-Flight Guardrail & Action Button */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <label className="flex items-start sm:items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none group max-w-xl">
            <input
              type="checkbox"
              checked={isConfidentialityConfirmed}
              onChange={(e) => setIsConfidentialityConfirmed(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer mt-0.5 sm:mt-0 shrink-0"
            />
            <span className="font-medium text-slate-800 group-hover:text-slate-900 leading-snug">
              {intakeDict.confidentialityCheck}
            </span>
          </label>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzeDisabled}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {intakeDict.analyzing}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {intakeDict.analyzeBtn}
                </span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* SECTION 2: Staging & Validation Gate */}
      {extractionResult && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-base font-semibold text-slate-900">
                  {intakeDict.stagingTitle}
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {intakeDict.analyzedAt} {extractionTimestamp}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {intakeDict.stagingSubtitle}
              </p>
            </div>

            <button
              onClick={handleCommit}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{intakeDict.commitBtn}</span>
            </button>
          </div>

          {/* Insufficient Input Alert */}
          {!extractionResult.isSufficientInput && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-rose-900">{intakeDict.insufficientTitle}</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  {extractionResult.insufficiencyReason || (language === 'es' ? 'Las notas proporcionadas estaban vacías o carecían de actualizaciones accionables.' : language === 'fr' ? 'Les notes fournies étaient vides ou manquaient de mises à jour exploitables.' : 'The notes provided were empty or lacked actionable project updates.')}
                </p>
              </div>
            </div>
          )}

          {/* Ambiguities & Contradictions Alert */}
          {extractionResult.ambiguitiesAndContradictions.length > 0 && (
            <div className="p-4 bg-rose-50/90 border border-rose-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{intakeDict.contradictionsTitle} ({extractionResult.ambiguitiesAndContradictions.length})</span>
              </div>
              <ul className="list-disc pl-5 text-xs text-rose-700 space-y-1">
                {extractionResult.ambiguitiesAndContradictions.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Part A: Proposed Action Updates (Diff Cards) */}
          {stagingActionUpdates.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>{intakeDict.proposedActionUpdates} ({stagingActionUpdates.length})</span>
                <span className="text-[11px] font-normal lowercase text-slate-400">{intakeDict.matchedDiffing}</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stagingActionUpdates.map((update, idx) => {
                  const existing = currentActions.find((a) => a.id === update.targetActionId);
                  const isChecked = !!selectedActionUpdates[idx];
                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg p-3.5 transition-all ${
                        isChecked ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setSelectedActionUpdates((prev) => ({ ...prev, [idx]: e.target.checked }))
                            }
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-mono text-xs font-semibold text-slate-900">
                            {update.targetActionId}
                          </span>
                        </label>
                        <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {existing ? existing.title : 'Action item'}
                        </span>
                      </div>

                      {/* Diff Comparison */}
                      <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs bg-white border border-slate-200 rounded p-2 font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">{intakeDict.currentValue}</span>
                          <span className="text-slate-700 text-xs">
                            {intakeDict.statusLabel} <strong className="text-slate-900">{existing?.status || 'Unknown'}</strong>
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-blue-600 block uppercase">{intakeDict.proposedValue}</span>
                          <span className="text-blue-700 text-xs font-semibold">
                            {intakeDict.statusLabel} {update.proposedStatus || existing?.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-600">
                        <strong className="text-slate-800">{intakeDict.rationaleQuote}</strong> {update.reasonAndQuote}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Part B: Proposed Risk Updates */}
          {stagingRiskUpdates.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {intakeDict.proposedRiskUpdates} ({stagingRiskUpdates.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stagingRiskUpdates.map((update, idx) => {
                  const existing = currentRisks.find((r) => r.id === update.targetRiskId);
                  const isChecked = !!selectedRiskUpdates[idx];
                  return (
                    <div
                      key={idx}
                      className={`border rounded-lg p-3.5 transition-all ${
                        isChecked ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setSelectedRiskUpdates((prev) => ({ ...prev, [idx]: e.target.checked }))
                            }
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span className="font-mono text-xs font-semibold text-slate-900">
                            {update.targetRiskId}
                          </span>
                        </label>
                        <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {existing?.description}
                        </span>
                      </div>

                      <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs bg-white border border-slate-200 rounded p-2 font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">{intakeDict.currentStatus}</span>
                          <span className="text-slate-700">{existing?.status}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-600 block uppercase">{intakeDict.proposedStatus}</span>
                          <span className="text-amber-800 font-semibold">{update.proposedStatus}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] text-slate-600">
                        <strong className="text-slate-800">{intakeDict.reason}</strong> {update.reasonAndQuote}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Part C: Staging Table for New Action Items */}
          {stagingNewActions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {intakeDict.newActionsTitle} ({stagingNewActions.length})
                </h4>
                <span className="text-[11px] text-slate-400">{intakeDict.editableNotice}</span>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3 w-10">{intakeDict.colSelect}</th>
                      <th className="p-3">{intakeDict.colTitle}</th>
                      <th className="p-3">{intakeDict.colOwner}</th>
                      <th className="p-3">{intakeDict.colDueDate}</th>
                      <th className="p-3">{intakeDict.colStatus}</th>
                      <th className="p-3">{intakeDict.colEpistemic}</th>
                      <th className="p-3">{intakeDict.colRationale}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stagingNewActions.map((action, idx) => {
                      const isChecked = !!selectedNewActions[idx];
                      return (
                        <tr key={idx} className={isChecked ? 'bg-white' : 'bg-slate-50/50 opacity-60'}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setSelectedNewActions((prev) => ({ ...prev, [idx]: e.target.checked }))
                              }
                              className="rounded text-blue-600"
                            />
                          </td>
                          <td className="p-3 font-medium text-slate-900 min-w-[200px]">
                            <input
                              type="text"
                              value={action.title}
                              onChange={(e) => {
                                const copy = [...stagingNewActions];
                                copy[idx].title = e.target.value;
                                setStagingNewActions(copy);
                              }}
                              className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-none"
                            />
                            <div className="text-[10px] text-slate-400 mt-1 italic font-sans truncate max-w-xs">
                              "{action.sourceQuote}"
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={action.owner || ''}
                              placeholder={intakeDict.unassigned}
                              onChange={(e) => {
                                const copy = [...stagingNewActions];
                                copy[idx].owner = e.target.value.trim() ? e.target.value : null;
                                setStagingNewActions(copy);
                              }}
                              className={`w-28 text-xs border rounded px-1.5 py-0.5 ${
                                !action.owner ? 'border-amber-300 bg-amber-50/50 text-amber-800' : 'border-slate-200'
                              }`}
                            />
                          </td>
                          <td className="p-3 font-mono">
                            <input
                              type="date"
                              value={action.dueDate || ''}
                              onChange={(e) => {
                                const copy = [...stagingNewActions];
                                copy[idx].dueDate = e.target.value || null;
                                setStagingNewActions(copy);
                              }}
                              className={`w-32 text-xs border rounded px-1.5 py-0.5 ${
                                !action.dueDate ? 'border-amber-300 bg-amber-50/50 text-amber-800' : 'border-slate-200'
                              }`}
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={action.status}
                              onChange={(e) => {
                                const copy = [...stagingNewActions];
                                copy[idx].status = e.target.value as any;
                                setStagingNewActions(copy);
                              }}
                              className="border border-slate-200 rounded px-1.5 py-0.5 text-xs bg-white"
                            >
                              <option value="Not Started">{intakeDict.optNotStarted}</option>
                              <option value="In Progress">{intakeDict.optInProgress}</option>
                              <option value="Blocked">{intakeDict.optBlocked}</option>
                              <option value="Completed">{intakeDict.optCompleted}</option>
                            </select>
                          </td>
                          <td className="p-3">{getEpistemicBadge(action.epistemicStatus)}</td>
                          <td className="p-3 text-[11px] text-slate-500 max-w-xs">
                            {action.validationNotes || <span className="text-slate-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Part D: Staging Table for New Risks & Issues (ISO 31000) */}
          {stagingNewRisks.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {intakeDict.newRisksTitle} ({stagingNewRisks.length})
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-3 w-10">{intakeDict.colSelect}</th>
                      <th className="p-3">{intakeDict.colCategory}</th>
                      <th className="p-3">{intakeDict.colDescription}</th>
                      <th className="p-3">{intakeDict.colOwner}</th>
                      <th className="p-3">{intakeDict.colProb}</th>
                      <th className="p-3">{intakeDict.colImpact}</th>
                      <th className="p-3">{intakeDict.colScore}</th>
                      <th className="p-3">{intakeDict.colStrategy}</th>
                      <th className="p-3">{intakeDict.colAiMitigation}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stagingNewRisks.map((risk, idx) => {
                      const isChecked = !!selectedNewRisks[idx];
                      const score = calculateScore(risk.probability, risk.impact);
                      return (
                        <tr key={idx} className={isChecked ? 'bg-white' : 'bg-slate-50/50 opacity-60'}>
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) =>
                                setSelectedNewRisks((prev) => ({ ...prev, [idx]: e.target.checked }))
                              }
                              className="rounded text-blue-600"
                            />
                          </td>
                          <td className="p-3">
                            <select
                              value={risk.category}
                              onChange={(e) => {
                                const copy = [...stagingNewRisks];
                                const cat = e.target.value as RiskCategory;
                                copy[idx].category = cat;
                                if (cat === 'Blocker' || cat === 'Issue') {
                                  copy[idx].probability = 5;
                                }
                                setStagingNewRisks(copy);
                              }}
                              className="border border-slate-200 rounded px-1.5 py-0.5 text-xs bg-white"
                            >
                              <option value="Risk">{intakeDict.riskBadge}</option>
                              <option value="Issue">{intakeDict.issueBadge}</option>
                              <option value="Blocker">{intakeDict.blockerBadge}</option>
                            </select>
                          </td>
                          <td className="p-3 font-medium text-slate-900 min-w-[220px]">
                            <input
                              type="text"
                              value={risk.description}
                              onChange={(e) => {
                                const copy = [...stagingNewRisks];
                                copy[idx].description = e.target.value;
                                setStagingNewRisks(copy);
                              }}
                              className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-blue-500 focus:outline-none"
                            />
                            <div className="text-[10px] text-slate-400 mt-1 italic truncate max-w-xs">
                              "{risk.sourceQuote}"
                            </div>
                          </td>
                          <td className="p-3">
                            <input
                              type="text"
                              value={risk.owner || ''}
                              placeholder={intakeDict.unassigned}
                              onChange={(e) => {
                                const copy = [...stagingNewRisks];
                                copy[idx].owner = e.target.value || null;
                                setStagingNewRisks(copy);
                              }}
                              className="w-24 text-xs border border-slate-200 rounded px-1.5 py-0.5"
                            />
                          </td>
                          <td className="p-3 font-mono">
                            <input
                              type="number"
                              min={1}
                              max={5}
                              disabled={risk.category === 'Issue' || risk.category === 'Blocker'}
                              value={risk.probability}
                              onChange={(e) => {
                                const copy = [...stagingNewRisks];
                                copy[idx].probability = Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) as any;
                                setStagingNewRisks(copy);
                              }}
                              className="w-12 border border-slate-200 rounded px-1.5 py-0.5 text-center disabled:bg-slate-100 disabled:text-slate-500"
                            />
                          </td>
                          <td className="p-3 font-mono">
                            <input
                              type="number"
                              min={1}
                              max={5}
                              value={risk.impact}
                              onChange={(e) => {
                                const copy = [...stagingNewRisks];
                                copy[idx].impact = Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) as any;
                                setStagingNewRisks(copy);
                              }}
                              className="w-12 border border-slate-200 rounded px-1.5 py-0.5 text-center"
                            />
                          </td>
                          <td className="p-3 font-mono font-bold">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${
                                score >= 15
                                  ? 'bg-rose-50 text-rose-700'
                                  : score >= 8
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {score}
                            </span>
                          </td>
                          <td className="p-3 min-w-[200px]">
                            <div className="text-[11px] font-semibold text-slate-700">{risk.strategy}</div>
                            <input
                              type="text"
                              value={risk.mitigationPlan}
                              onChange={(e) => {
                                const copy = [...stagingNewRisks];
                                copy[idx].mitigationPlan = e.target.value;
                                setStagingNewRisks(copy);
                              }}
                              className="text-[11px] text-slate-600 w-full border-b border-dashed border-slate-300 focus:outline-none"
                            />
                          </td>
                          <td className="p-3">
                            {risk.isMitigationAIProposed && (
                              <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                                {intakeDict.aiProposed}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Part E: Extracted Decisions */}
          {stagingDecisions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {intakeDict.decisionsTitle} ({stagingDecisions.length})
              </h4>
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2">
                {stagingDecisions.map((dec, idx) => {
                  const isChecked = !!selectedDecisions[idx];
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-white p-2.5 rounded border border-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          setSelectedDecisions((prev) => ({ ...prev, [idx]: e.target.checked }))
                        }
                        className="rounded text-blue-600 mt-1"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={dec.decision}
                          onChange={(e) => {
                            const copy = [...stagingDecisions];
                            copy[idx].decision = e.target.value;
                            setStagingDecisions(copy);
                          }}
                          className="w-full text-xs font-semibold text-slate-900 border-b border-dashed border-slate-300 focus:outline-none"
                        />
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          {intakeDict.sourceQuote} "{dec.sourceQuote}"
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Commit Action */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {intakeDict.bottomNotice}
            </span>
            <button
              onClick={handleCommit}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{intakeDict.commitBtn}</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
