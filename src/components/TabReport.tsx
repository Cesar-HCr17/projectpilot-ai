import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  FileText,
  Sliders,
  CheckCircle2,
  Clock,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { ProjectState, RAGColor, RAGAssessment, Language } from '../types';
import { generateExecutiveSummary } from '../services/geminiService';
import { generateMarkdownReport, isOverdue } from '../utils/projectUtils';

interface TabReportProps {
  state: ProjectState;
  language?: Language;
  onUpdateRAG: (assessment: RAGAssessment) => void;
  onUpdateExecutiveSummary: (summary: string) => void;
}

export const TabReport: React.FC<TabReportProps> = ({
  state,
  language = 'en',
  onUpdateRAG,
  onUpdateExecutiveSummary,
}) => {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideColor, setOverrideColor] = useState<RAGColor>(state.ragAssessment.status);
  const [overrideJustification, setOverrideJustification] = useState(
    state.ragAssessment.overrideJustification || ''
  );

  const { ragAssessment, actions, risks, decisions, referenceDate, executiveSummary } = state;

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setApiError(null);
    try {
      const summary = await generateExecutiveSummary(
        {
          projectName: state.projectName,
          referenceDate: state.referenceDate,
          ragAssessment: state.ragAssessment,
          actions: state.actions,
          risks: state.risks,
          decisions: state.decisions,
        },
        language
      );
      onUpdateExecutiveSummary(summary);
    } catch (error: any) {
      console.error('Failed to generate executive summary:', error);
      const msg = error?.message || (typeof error === 'string' ? error : JSON.stringify(error));
      setApiError(msg);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdownReport(state);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRAG({
      ...ragAssessment,
      status: overrideColor,
      isManualOverride: true,
      overrideJustification: overrideJustification.trim(),
    });
    setIsOverrideModalOpen(false);
  };

  const handleResetOverride = () => {
    onUpdateRAG({
      ...ragAssessment,
      status: ragAssessment.calculatedStatus,
      isManualOverride: false,
      overrideJustification: undefined,
    });
  };

  // Derived subsets for the report
  const blockers = risks.filter((r) => r.category === 'Blocker' && r.status !== 'Resolved');
  const openIssues = risks.filter((r) => r.category === 'Issue' && r.status !== 'Resolved');
  const highRisks = risks.filter((r) => r.category === 'Risk' && r.score >= 15 && r.status !== 'Resolved');
  const overdueActions = actions.filter((a) => isOverdue(a.dueDate, referenceDate, a.status));
  const clarificationActions = actions.filter((a) => a.epistemicStatus === 'Needs Clarification');

  const reportDict = {
    en: {
      statusLabel: 'STATUS:',
      manualOverride: (calc: string) => `Manual PM Override (Calculated: ${calc})`,
      govAssessmentTitle: 'Deterministic Governance Assessment',
      justification: 'Justification:',
      noJustification: 'No justification entered',
      triggeredRule: 'Triggered Rule:',
      resetCalculated: (calc: string) => `Reset to Calculated (${calc})`,
      overrideRag: 'Override RAG',
      generateSummary: 'Generate AI Executive Summary',
      generating: 'Generating...',
      copyMarkdown: 'Copy Report as Markdown',
      copiedMarkdown: 'Copied Markdown!',
      activeInvariants: 'Active Deterministic Governance Invariants',
      sec1Title: '1. Executive Summary & Trajectory Analysis',
      sec1Subtitle: 'Strictly grounded in register IDs (no hallucinated data)',
      geminiError: 'Gemini Executive Summary Error',
      targetModel: 'Target model:',
      inspectError: 'Inspect the error message above for details.',
      noSummaryYet: 'No executive summary generated yet for this reporting period.',
      generateTwoPara: 'Generate 2-Paragraph Grounded Summary',
      sec2Title: (count: number) => `2. Ratified Project Decisions (${count})`,
      noDecisions: 'No formal decisions recorded in this cycle.',
      sourceQuote: 'Source Quote:',
      sec3Title: '3. Critical Impediments: Blockers & High Risks',
      activeBlockers: (count: number) => `Active Blockers (${count})`,
      zeroBlockers: 'Zero active blockers halting work.',
      owner: 'Owner:',
      unassigned: 'Unassigned',
      mitigationPlan: 'Mitigation Plan:',
      highRisks: (count: number) => `High Severity Risks (Score ≥ 15) (${count})`,
      allRisksTolerance: 'All active risks are within acceptable tolerance limits.',
      scoreLabel: 'Score',
      strategyLabel: 'Strategy:',
      sec4Title: '4. Action Items: Overdue & Critical Path Deliverables',
      overdueCommitments: (date: string) => `Overdue Commitments (Past Reference Date ${date})`,
      due: 'Due:',
      zeroOverdue: (date: string) => `Zero overdue actions as of reference date ${date}.`,
      sec5Title: (count: number) => `5. Governance Gate: Items Flagged for Human Clarification (${count})`,
      zeroAmbiguities: 'Zero ambiguities. All action items possess verified owners and calendar deadlines.',
      needsClarification: 'Needs Clarification',
      reason: 'Reason:',
      missingAttribution: 'Missing required governance attribution (owner or date).',
      source: 'Source:',
      modalTitle: 'Override Project RAG Status',
      modalNewStatus: (calc: string) => `New Status (Calculated was ${calc})`,
      modalJustification: 'Governance Override Justification *',
      modalJustificationPh: "Explain why the deterministic evaluation is being overridden (e.g. 'Customs release scheduled for 8am tomorrow with pre-authorized escrow')...",
      cancel: 'Cancel',
      applyOverride: 'Apply Override',
    },
    es: {
      statusLabel: 'ESTADO:',
      manualOverride: (calc: string) => `Sobrescritura Manual del GP (Calculado: ${calc})`,
      govAssessmentTitle: 'Evaluación Determinística de Gobernanza',
      justification: 'Justificación:',
      noJustification: 'Sin justificación ingresada',
      triggeredRule: 'Regla Activada:',
      resetCalculated: (calc: string) => `Restablecer a Calculado (${calc})`,
      overrideRag: 'Sobrescribir RAG',
      generateSummary: 'Generar Resumen Ejecutivo con IA',
      generating: 'Generando...',
      copyMarkdown: 'Copiar Informe como Markdown',
      copiedMarkdown: '¡Markdown Copiado!',
      activeInvariants: 'Invariantes Activos de Gobernanza Determinística',
      sec1Title: '1. Resumen Ejecutivo y Análisis de Trayectoria',
      sec1Subtitle: 'Estrictamente fundamentado en IDs del registro (cero datos inventados)',
      geminiError: 'Error del Resumen Ejecutivo Gemini',
      targetModel: 'Modelo objetivo:',
      inspectError: 'Inspeccione el mensaje de error anterior para más detalles.',
      noSummaryYet: 'Aún no se ha generado un resumen ejecutivo para este ciclo del proyecto.',
      generateTwoPara: 'Generar Resumen Fundamentado de 2 Párrafos',
      sec2Title: (count: number) => `2. Decisiones Ratificadas del Proyecto (${count})`,
      noDecisions: 'No se registraron decisiones formales en este ciclo.',
      sourceQuote: 'Cita Textual:',
      sec3Title: '3. Impedimentos Críticos: Bloqueos y Riesgos Altos',
      activeBlockers: (count: number) => `Bloqueos Activos (${count})`,
      zeroBlockers: 'Cero bloqueos activos deteniendo el trabajo.',
      owner: 'Responsable:',
      unassigned: 'Sin asignar',
      mitigationPlan: 'Plan de Mitigación:',
      highRisks: (count: number) => `Riesgos de Alta Severidad (Puntaje ≥ 15) (${count})`,
      allRisksTolerance: 'Todos los riesgos activos están dentro de los límites aceptables de tolerancia.',
      scoreLabel: 'Puntaje',
      strategyLabel: 'Estrategia:',
      sec4Title: '4. Acciones: Compromisos Vencidos y Ruta Crítica',
      overdueCommitments: (date: string) => `Compromisos Vencidos (Posteriores a Fecha de Referencia ${date})`,
      due: 'Vencimiento:',
      zeroOverdue: (date: string) => `Cero acciones vencidas a la fecha de referencia ${date}.`,
      sec5Title: (count: number) => `5. Compuerta de Gobernanza: Elementos que Requieren Aclaración (${count})`,
      zeroAmbiguities: 'Cero ambigüedades. Todas las acciones cuentan con responsables verificados y fechas límite.',
      needsClarification: 'Requiere Aclaración',
      reason: 'Motivo:',
      missingAttribution: 'Falta atribución requerida de gobernanza (responsable o fecha).',
      source: 'Fuente:',
      modalTitle: 'Sobrescribir Estado RAG del Proyecto',
      modalNewStatus: (calc: string) => `Nuevo Estado (El calculado era ${calc})`,
      modalJustification: 'Justificación de Sobrescritura de Gobernanza *',
      modalJustificationPh: "Explique por qué se sobrescribe la evaluación determinística (ej. 'Desaduanamiento programado para mañana a las 8am con fianza autorizada')...",
      cancel: 'Cancelar',
      applyOverride: 'Aplicar Sobrescritura',
    },
    fr: {
      statusLabel: 'STATUT :',
      manualOverride: (calc: string) => `Dérogation Manuelle du GP (Calculé : ${calc})`,
      govAssessmentTitle: 'Évaluation Déterministe de Gouvernance',
      justification: 'Justification :',
      noJustification: 'Aucune justification saisie',
      triggeredRule: 'Règle Déclenchée :',
      resetCalculated: (calc: string) => `Réinitialiser au Calculé (${calc})`,
      overrideRag: 'Déroger RAG',
      generateSummary: 'Générer Résumé Exécutif IA',
      generating: 'Génération en cours...',
      copyMarkdown: 'Copier Rapport en Markdown',
      copiedMarkdown: 'Rapport Copié !',
      activeInvariants: 'Invariants Actifs de Gouvernance Déterministe',
      sec1Title: '1. Résumé Exécutif et Analyse de Trajectoire',
      sec1Subtitle: 'Strictement fondé sur les identifiants du registre (zéro hallucination)',
      geminiError: 'Erreur de Résumé Exécutif Gemini',
      targetModel: 'Modèle cible :',
      inspectError: 'Consultez le message d\'erreur ci-dessus pour plus de détails.',
      noSummaryYet: 'Aucun résumé exécutif généré pour cette période du projet.',
      generateTwoPara: 'Générer Résumé Fondé en 2 Paragraphes',
      sec2Title: (count: number) => `2. Décisions Ratifiées du Projet (${count})`,
      noDecisions: 'Aucune décision formelle enregistrée lors de ce cycle.',
      sourceQuote: 'Citation Source :',
      sec3Title: '3. Entraves Critiques : Blocages et Risques Élevés',
      activeBlockers: (count: number) => `Blocages Actifs (${count})`,
      zeroBlockers: 'Zéro blocage actif entravant les travaux.',
      owner: 'Responsable :',
      unassigned: 'Non assigné',
      mitigationPlan: 'Plan d\'Atténuation :',
      highRisks: (count: number) => `Risques de Haute Gravité (Score ≥ 15) (${count})`,
      allRisksTolerance: 'Tous les risques actifs respectent les seuils de tolérance acceptables.',
      scoreLabel: 'Score',
      strategyLabel: 'Stratégie :',
      sec4Title: '4. Actions : Engagements en Retard et Chemin Critique',
      overdueCommitments: (date: string) => `Engagements en Retard (Postérieurs à Date de Référence ${date})`,
      due: 'Échéance :',
      zeroOverdue: (date: string) => `Zéro action en retard à la date de référence ${date}.`,
      sec5Title: (count: number) => `5. Porte de Gouvernance : Éléments en Attente de Clarification (${count})`,
      zeroAmbiguities: 'Zéro ambiguïté. Toutes les actions possèdent des responsables vérifiés et des échéances.',
      needsClarification: 'Nécessite une Clarification',
      reason: 'Motif :',
      missingAttribution: 'Attribution de gouvernance requise manquante (responsable ou date).',
      source: 'Source :',
      modalTitle: 'Déroger au Statut RAG du Projet',
      modalNewStatus: (calc: string) => `Nouveau Statut (Le calculé était ${calc})`,
      modalJustification: 'Justification de Dérogation de Gouvernance *',
      modalJustificationPh: "Expliquez pourquoi l'évaluation déterministe est dérogée (ex. 'Dédouanement prévu demain 8h avec caution pré-autorisée')...",
      cancel: 'Annuler',
      applyOverride: 'Appliquer Dérogation',
    },
  }[language];

  const ragStyle = {
    RED: {
      border: 'border-rose-300',
      bg: 'bg-rose-50/70',
      text: 'text-rose-800',
      badge: 'bg-rose-600 text-white',
      icon: <ShieldAlert className="w-6 h-6 text-rose-600" />,
    },
    AMBER: {
      border: 'border-amber-300',
      bg: 'bg-amber-50/70',
      text: 'text-amber-900',
      badge: 'bg-amber-600 text-white',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    },
    GREEN: {
      border: 'border-emerald-300',
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-900',
      badge: 'bg-emerald-600 text-white',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    },
  }[ragAssessment.status];

  return (
    <div className="space-y-6">
      {/* SECTION 1: Deterministic RAG Status Header */}
      <div className={`border rounded-xl p-5 shadow-xs transition-all ${ragStyle.border} ${ragStyle.bg}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-white rounded-lg border border-slate-200/80 shadow-xs shrink-0">
              {ragStyle.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded tracking-wide uppercase ${ragStyle.badge}`}>
                  {reportDict.statusLabel} {ragAssessment.status}
                </span>
                {ragAssessment.isManualOverride && (
                  <span className="text-[11px] font-mono text-purple-700 bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded">
                    {reportDict.manualOverride(ragAssessment.calculatedStatus)}
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">
                {reportDict.govAssessmentTitle}
              </h2>
              <p className={`text-xs mt-1 font-medium ${ragStyle.text}`}>
                {ragAssessment.isManualOverride
                  ? `${reportDict.justification} "${ragAssessment.overrideJustification || reportDict.noJustification}"`
                  : `${reportDict.triggeredRule} ${ragAssessment.reason}`}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {ragAssessment.isManualOverride ? (
              <button
                onClick={handleResetOverride}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                {reportDict.resetCalculated(ragAssessment.calculatedStatus)}
              </button>
            ) : null}

            <button
              onClick={() => {
                setOverrideColor(ragAssessment.status);
                setOverrideJustification(ragAssessment.overrideJustification || '');
                setIsOverrideModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>{reportDict.overrideRag}</span>
            </button>

            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isGeneratingSummary ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{reportDict.generating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>{reportDict.generateSummary}</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs cursor-pointer"
            >
              {copiedMarkdown ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{reportDict.copiedMarkdown}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{reportDict.copyMarkdown}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Breakdown of Triggered Rules */}
        {ragAssessment.triggeredRules.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              {reportDict.activeInvariants}
            </span>
            <div className="space-y-1">
              {ragAssessment.triggeredRules.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-700">
                  <span className="text-slate-400">·</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Executive Summary */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            {reportDict.sec1Title}
          </h3>
          <span className="text-[11px] text-slate-400">
            {reportDict.sec1Subtitle}
          </span>
        </div>

        {/* Real Error Banner displaying error.message */}
        {apiError && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-rose-950">{reportDict.geminiError}</h4>
                <p className="font-mono text-[11px] text-rose-900 bg-rose-100/70 p-2.5 rounded border border-rose-200 break-all leading-relaxed">
                  {apiError}
                </p>
                <p className="text-[11px] text-rose-700">
                  {reportDict.targetModel} <code className="font-mono font-semibold">gemini-flash-latest</code>. {reportDict.inspectError}
                </p>
              </div>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-rose-400 hover:text-rose-700 font-bold p-1 text-sm cursor-pointer"
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {executiveSummary ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-line">
            {executiveSummary}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-6 text-center space-y-2">
            <p className="text-xs text-slate-500">
              {reportDict.noSummaryYet}
            </p>
            <button
              onClick={handleGenerateSummary}
              disabled={isGeneratingSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-medium cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>{reportDict.generateTwoPara}</span>
            </button>
          </div>
        )}
      </section>

      {/* SECTION 3: Key Decisions Logged */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {reportDict.sec2Title(decisions.length)}
        </h3>
        {decisions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">{reportDict.noDecisions}</p>
        ) : (
          <div className="space-y-2">
            {decisions.map((dec) => (
              <div
                key={dec.id}
                className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{dec.id}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{dec.dateRecorded}</span>
                </div>
                <p className="text-slate-800 font-medium">{dec.decision}</p>
                <div className="text-[11px] text-slate-500 italic">
                  {reportDict.sourceQuote} "{dec.sourceQuote}"
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: Active Blockers & High Severity Risks */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {reportDict.sec3Title}
        </h3>

        {/* Blockers */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            {reportDict.activeBlockers(blockers.length)}
          </span>
          {blockers.length === 0 ? (
            <p className="text-xs text-slate-400 italic pl-5">{reportDict.zeroBlockers}</p>
          ) : (
            blockers.map((b) => (
              <div key={b.id} className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-900">{b.id}</span>
                  <span className="text-rose-700 font-medium">{reportDict.owner} {b.owner || reportDict.unassigned}</span>
                </div>
                <p className="text-slate-900 font-semibold">{b.description}</p>
                <div className="text-slate-700 text-[11px]">
                  <strong>{reportDict.mitigationPlan}</strong> {b.mitigationPlan}
                </div>
              </div>
            ))
          )}
        </div>

        {/* High Risks */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            {reportDict.highRisks(highRisks.length)}
          </span>
          {highRisks.length === 0 ? (
            <p className="text-xs text-slate-400 italic pl-5">{reportDict.allRisksTolerance}</p>
          ) : (
            highRisks.map((r) => (
              <div key={r.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-900">
                    {r.id} · {reportDict.scoreLabel} {r.score} (P:{r.probability} × I:{r.impact})
                  </span>
                  <span className="text-slate-600">{reportDict.strategyLabel} {r.strategy}</span>
                </div>
                <p className="text-slate-900 font-medium">{r.description}</p>
                <div className="text-slate-700 text-[11px]">
                  <strong>{reportDict.mitigationPlan}</strong> {r.mitigationPlan}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* SECTION 5: Overdue & Upcoming Actions */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {reportDict.sec4Title}
        </h3>
        {overdueActions.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-rose-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{reportDict.overdueCommitments(referenceDate)}</span>
            </div>
            {overdueActions.map((a) => (
              <div key={a.id} className="p-3 bg-rose-50/40 border border-rose-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{a.id}</span>
                  <span className="text-rose-700 font-mono font-semibold">{reportDict.due} {a.dueDate}</span>
                </div>
                <p className="text-slate-800 font-medium">{a.title}</p>
                <div className="text-slate-500 text-[11px]">
                  {reportDict.owner} {a.owner || <span className="text-amber-700">{reportDict.unassigned}</span>} · {reportDict.statusLabel} {a.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-emerald-50/40 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{reportDict.zeroOverdue(referenceDate)}</span>
          </div>
        )}
      </section>

      {/* SECTION 6: Items Requiring Clarification */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          {reportDict.sec5Title(clarificationActions.length)}
        </h3>
        {clarificationActions.length === 0 ? (
          <p className="text-xs text-slate-400 italic">
            {reportDict.zeroAmbiguities}
          </p>
        ) : (
          <div className="space-y-2">
            {clarificationActions.map((c) => (
              <div key={c.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-900">{c.id}</span>
                  <span className="text-amber-800 text-[11px] font-semibold">{reportDict.needsClarification}</span>
                </div>
                <p className="text-slate-900 font-medium">{c.title}</p>
                <div className="text-[11px] text-amber-900">
                  <strong>{reportDict.reason}</strong> {c.validationNotes || reportDict.missingAttribution}
                </div>
                {c.sourceQuote && (
                  <div className="text-[10px] text-slate-500 italic">
                    {reportDict.source} "{c.sourceQuote}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Manual Override Modal */}
      {isOverrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm">{reportDict.modalTitle}</h3>
              <button onClick={() => setIsOverrideModalOpen(false)} className="text-slate-400 text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {reportDict.modalNewStatus(ragAssessment.calculatedStatus)}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['GREEN', 'AMBER', 'RED'] as const).map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setOverrideColor(color)}
                      className={`p-2 border rounded font-mono font-bold text-xs cursor-pointer ${
                        overrideColor === color
                          ? color === 'RED'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : color === 'AMBER'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-emerald-600 text-white border-emerald-600'
                          : 'border-slate-200 text-slate-700 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {reportDict.modalJustification}
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={reportDict.modalJustificationPh}
                  value={overrideJustification}
                  onChange={(e) => setOverrideJustification(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOverrideModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  {reportDict.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium cursor-pointer"
                >
                  {reportDict.applyOverride}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
