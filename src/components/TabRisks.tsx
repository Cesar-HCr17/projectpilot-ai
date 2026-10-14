import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Flame,
  CheckCircle,
  Plus,
  Download,
  Filter,
  Check,
  Search,
  Trash2,
  Sliders,
  Grid,
} from 'lucide-react';
import { RiskItem, RiskCategory, RiskStrategy, EpistemicStatus, RiskFramework, Language } from '../types';
import { calculateScore, getScoreColor, exportRisksToCSV, generateNextId } from '../utils/projectUtils';

interface TabRisksProps {
  risks: RiskItem[];
  riskFramework: RiskFramework;
  language?: Language;
  onUpdateRisk: (id: string, updates: Partial<RiskItem>) => void;
  onAddRisk: (risk: RiskItem) => void;
  onDeleteRisk: (id: string) => void;
  onToggleFramework?: (framework: RiskFramework) => void;
}

export const TabRisks: React.FC<TabRisksProps> = ({
  risks,
  riskFramework,
  language = 'en',
  onUpdateRisk,
  onAddRisk,
  onDeleteRisk,
  onToggleFramework,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<'All' | RiskCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Monitoring' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMatrixVisual, setShowMatrixVisual] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const risksDict = {
    en: {
      kpiBlockers: 'Active Blockers',
      kpiBlockersSub: 'Critical path halted (Prob locked to 5)',
      kpiIssues: 'Open Realized Issues',
      kpiIssuesSub: 'Occurring problems in active resolution',
      kpiHighRisks: 'High Severity Risks',
      kpiHighRisksSub: riskFramework === 'PMI' ? 'PMI Severity Score ≥ 15' : 'ISO 31000 Score ≥ 15 (Red Zone)',
      kpiTotal: 'Total Active Register',
      kpiTotalSub: 'Total open and monitoring items',
      govAlignmentLabel: 'Risk Matrix Framework:',
      govAlignmentSub: 'All other registers (Deliverables, Action items, and Issue logs) are strictly governed under',
      pmiStandard: 'PMI Standards',
      switchTo: 'Switch to',
      matrixTitle: riskFramework === 'PMI' ? 'PMI Qualitative Risk Severity Matrix (PMBOK® 5 × 5)' : 'ISO 31000 Risk Assessment Heatmap (5 × 5 Grid)',
      collapseMatrix: 'Collapse Matrix',
      expandMatrix: 'Expand Matrix',
      probAxis: 'Probability (1–5)',
      impactAxis: 'Impact (1–5)',
      lowRisk: 'Low Risk (1–6)',
      medRisk: 'Medium Risk (8–12)',
      highRisk: 'High Severity / Critical (15–25)',
      searchPh: 'Search risks, issues, mitigation plans...',
      typeFilter: 'Type:',
      statusFilter: 'Status:',
      all: 'All',
      riskCat: 'Risk',
      issueCat: 'Issue',
      blockerCat: 'Blocker',
      openSt: 'Open',
      monitoringSt: 'Monitoring',
      resolvedSt: 'Resolved',
      addManualRisk: 'Add Manual Risk',
      exportCsv: 'Export CSV',
      colId: 'ID',
      colCat: 'Category',
      colDesc: 'Description & Source',
      colOwner: 'Owner',
      colProb: 'Prob (1-5)',
      colImpact: 'Impact (1-5)',
      colScore: 'Score',
      colStrategy: 'Strategy',
      colMitigation: 'Mitigation Plan & Governance',
      colStatus: 'Status',
      colAction: 'Action',
      emptyMatch: 'No risks or issues found matching your filters.',
      unassignedPh: 'Unassigned',
      lockedProb: 'Locked 5',
      aiProposedVerify: 'AI Proposed — Click to Verify',
      deleteTitle: 'Delete risk',
      modalTitle: `Add New Risk / Issue (${riskFramework === 'PMI' ? 'PMI PMBOK® Standard' : 'ISO 31000 Standard'})`,
      modalCat: 'Category *',
      modalOwner: 'Risk Owner',
      modalDesc: 'Description *',
      modalDescPh: 'Describe the operational risk, trigger conditions, and impact...',
      modalStrategy: 'Strategy',
      modalMitigation: 'Mitigation Plan',
      modalMitigationPh: 'Actionable mitigation steps...',
      cancelBtn: 'Cancel',
      saveBtn: 'Save to Register',
    },
    es: {
      kpiBlockers: 'Bloqueos Activos',
      kpiBlockersSub: 'Ruta crítica detenida (Prob fijada en 5)',
      kpiIssues: 'Problemas Realizados Abiertos',
      kpiIssuesSub: 'Problemas en curso en resolución activa',
      kpiHighRisks: 'Riesgos de Alta Severidad',
      kpiHighRisksSub: riskFramework === 'PMI' ? 'Puntaje de Severidad PMI ≥ 15' : 'Puntaje ISO 31000 ≥ 15 (Zona Roja)',
      kpiTotal: 'Total en Registro Activo',
      kpiTotalSub: 'Total de elementos abiertos y en monitoreo',
      govAlignmentLabel: 'Marco de Matriz de Riesgos:',
      govAlignmentSub: 'Los demás registros (Entregables, Acciones y Problemas) se rigen estrictamente por',
      pmiStandard: 'Normas PMI',
      switchTo: 'Cambiar a',
      matrixTitle: riskFramework === 'PMI' ? 'Matriz Cualitativa de Severidad de Riesgos PMI (PMBOK® 5 × 5)' : 'Mapa de Calor de Evaluación de Riesgos ISO 31000 (Cuadrícula 5 × 5)',
      collapseMatrix: 'Contraer Matriz',
      expandMatrix: 'Expandir Matriz',
      probAxis: 'Probabilidad (1–5)',
      impactAxis: 'Impacto (1–5)',
      lowRisk: 'Riesgo Bajo (1–6)',
      medRisk: 'Riesgo Medio (8–12)',
      highRisk: 'Alta Severidad / Crítico (15–25)',
      searchPh: 'Buscar riesgos, problemas, planes de mitigación...',
      typeFilter: 'Tipo:',
      statusFilter: 'Estado:',
      all: 'Todos',
      riskCat: 'Riesgo',
      issueCat: 'Problema',
      blockerCat: 'Bloqueo',
      openSt: 'Abierto',
      monitoringSt: 'Monitoreo',
      resolvedSt: 'Resuelto',
      addManualRisk: 'Agregar Riesgo Manual',
      exportCsv: 'Exportar CSV',
      colId: 'ID',
      colCat: 'Categoría',
      colDesc: 'Descripción y Cita',
      colOwner: 'Responsable',
      colProb: 'Prob (1-5)',
      colImpact: 'Impacto (1-5)',
      colScore: 'Puntaje',
      colStrategy: 'Estrategia',
      colMitigation: 'Plan de Mitigación y Gobernanza',
      colStatus: 'Estado',
      colAction: 'Acción',
      emptyMatch: 'No se encontraron riesgos o problemas que coincidan con los filtros.',
      unassignedPh: 'Sin asignar',
      lockedProb: 'Fijado 5',
      aiProposedVerify: 'Propuesto por IA — Clic para Verificar',
      deleteTitle: 'Eliminar riesgo',
      modalTitle: `Registrar Nuevo Riesgo / Problema (${riskFramework === 'PMI' ? 'Norma PMI PMBOK®' : 'Norma ISO 31000'})`,
      modalCat: 'Categoría *',
      modalOwner: 'Responsable del Riesgo',
      modalDesc: 'Descripción *',
      modalDescPh: 'Describa el riesgo operativo, factores desencadenantes e impacto...',
      modalStrategy: 'Estrategia',
      modalMitigation: 'Plan de Mitigación',
      modalMitigationPh: 'Acciones de mitigación concretas...',
      cancelBtn: 'Cancelar',
      saveBtn: 'Guardar en Registro',
    },
    fr: {
      kpiBlockers: 'Blocages Actifs',
      kpiBlockersSub: 'Chemin critique interrompu (Prob fixée à 5)',
      kpiIssues: 'Problèmes Réalisés Ouverts',
      kpiIssuesSub: 'Problèmes avérés en cours de résolution',
      kpiHighRisks: 'Risques de Haute Gravité',
      kpiHighRisksSub: riskFramework === 'PMI' ? 'Score de Gravité PMI ≥ 15' : 'Score ISO 31000 ≥ 15 (Zone Rouge)',
      kpiTotal: 'Total Registre Actif',
      kpiTotalSub: 'Total des éléments ouverts et sous surveillance',
      govAlignmentLabel: 'Cadre de Matrice des Risques :',
      govAlignmentSub: 'Tous les autres registres (Livrables, Actions et Journal d\'incidents) sont régis selon',
      pmiStandard: 'Normes PMI',
      switchTo: 'Passer à',
      matrixTitle: riskFramework === 'PMI' ? 'Matrice Qualitative de Gravité des Risques PMI (PMBOK® 5 × 5)' : 'Cartographie d\'Évaluation des Risques ISO 31000 (Grille 5 × 5)',
      collapseMatrix: 'Réduire la Matrice',
      expandMatrix: 'Agrandir la Matrice',
      probAxis: 'Probabilité (1–5)',
      impactAxis: 'Impact (1–5)',
      lowRisk: 'Risque Faible (1–6)',
      medRisk: 'Risque Moyen (8–12)',
      highRisk: 'Haute Gravité / Critique (15–25)',
      searchPh: 'Rechercher risques, problèmes, plans d\'atténuation...',
      typeFilter: 'Type :',
      statusFilter: 'Statut :',
      all: 'Tous',
      riskCat: 'Risque',
      issueCat: 'Problème',
      blockerCat: 'Blocage',
      openSt: 'Ouvert',
      monitoringSt: 'Surveillance',
      resolvedSt: 'Résolu',
      addManualRisk: 'Ajouter un Risque Manuel',
      exportCsv: 'Exporter CSV',
      colId: 'ID',
      colCat: 'Catégorie',
      colDesc: 'Description et Source',
      colOwner: 'Responsable',
      colProb: 'Prob (1-5)',
      colImpact: 'Impact (1-5)',
      colScore: 'Score',
      colStrategy: 'Stratégie',
      colMitigation: 'Plan d\'Atténuation et Gouvernance',
      colStatus: 'Statut',
      colAction: 'Action',
      emptyMatch: 'Aucun risque ou problème trouvé correspondant aux filtres.',
      unassignedPh: 'Non assigné',
      lockedProb: 'Bloqué 5',
      aiProposedVerify: 'Proposé par IA — Cliquer pour Vérifier',
      deleteTitle: 'Supprimer le risque',
      modalTitle: `Ajouter un Nouveau Risque / Problème (${riskFramework === 'PMI' ? 'Norme PMI PMBOK®' : 'Norme ISO 31000'})`,
      modalCat: 'Catégorie *',
      modalOwner: 'Responsable du Risque',
      modalDesc: 'Description *',
      modalDescPh: 'Décrivez le risque opérationnel, conditions de déclenchement et impact...',
      modalStrategy: 'Stratégie',
      modalMitigation: 'Plan d\'Atténuation',
      modalMitigationPh: 'Mesures d\'atténuation concrètes...',
      cancelBtn: 'Annuler',
      saveBtn: 'Enregistrer au Registre',
    },
  }[language];

  // Modal fields
  const [newCategory, setNewCategory] = useState<RiskCategory>('Risk');
  const [newDesc, setNewDesc] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newProb, setNewProb] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [newImpact, setNewImpact] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [newStrategy, setNewStrategy] = useState<RiskStrategy>('Mitigate');
  const [newMitigation, setNewMitigation] = useState('');

  // KPIs
  const activeBlockers = risks.filter((r) => r.category === 'Blocker' && r.status !== 'Resolved').length;
  const openIssues = risks.filter((r) => r.category === 'Issue' && r.status !== 'Resolved').length;
  const highRisks = risks.filter(
    (r) => r.category === 'Risk' && r.score >= 15 && r.status !== 'Resolved'
  ).length;
  const totalOpen = risks.filter((r) => r.status !== 'Resolved').length;

  const filteredRisks = useMemo(() => {
    return risks.filter((risk) => {
      const matchesCategory = categoryFilter === 'All' || risk.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || risk.status === statusFilter;
      const matchesSearch =
        risk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        risk.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (risk.owner && risk.owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
        risk.mitigationPlan.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [risks, categoryFilter, statusFilter, searchQuery]);

  const handleCreateRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;

    const nextId = generateNextId('RSK', risks.map((r) => r.id));
    const prob = (newCategory === 'Blocker' || newCategory === 'Issue') ? 5 : newProb;
    const score = calculateScore(prob, newImpact);

    onAddRisk({
      id: nextId,
      category: newCategory,
      description: newDesc.trim(),
      owner: newOwner.trim() ? newOwner.trim() : null,
      probability: prob,
      impact: newImpact,
      score,
      strategy: newStrategy,
      mitigationPlan: newMitigation.trim() || 'Pending mitigation plan development',
      isMitigationAIProposed: false,
      status: 'Open',
      epistemicStatus: 'Confirmed',
      sourceQuote: 'Manually entered into Risk Register.',
    });

    setNewDesc('');
    setNewOwner('');
    setNewMitigation('');
    setNewCategory('Risk');
    setIsAddModalOpen(false);
  };

  const verifyMitigation = (id: string) => {
    onUpdateRisk(id, { isMitigationAIProposed: false });
  };

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-rose-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-rose-700 uppercase tracking-wider block">
            {risksDict.kpiBlockers}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-rose-700 tabular-nums">
              {activeBlockers}
            </span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{risksDict.kpiBlockersSub}</p>
        </div>

        <div className="bg-white border border-orange-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-orange-700 uppercase tracking-wider block">
            {risksDict.kpiIssues}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-orange-700 tabular-nums">
              {openIssues}
            </span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{risksDict.kpiIssuesSub}</p>
        </div>

        <div className="bg-white border border-amber-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-amber-700 uppercase tracking-wider block">
            {risksDict.kpiHighRisks}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-amber-800 tabular-nums">
              {highRisks}
            </span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {risksDict.kpiHighRisksSub}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            {risksDict.kpiTotal}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
              {totalOpen}
            </span>
            <CheckCircle className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{risksDict.kpiTotalSub}</p>
        </div>
      </div>

      {/* Governance Standards Alignment Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
          <span className="text-slate-600">
            {risksDict.govAlignmentLabel} <strong className="text-slate-900">{riskFramework === 'PMI' ? 'PMI PMBOK® Standard' : 'ISO 31000 Standard'}</strong>
            <span className="mx-2 text-slate-300">|</span>
            {risksDict.govAlignmentSub} <strong className="text-slate-900">{risksDict.pmiStandard}</strong>.
          </span>
        </div>

        {onToggleFramework && (
          <button
            type="button"
            onClick={() => onToggleFramework(riskFramework === 'PMI' ? 'ISO31000' : 'PMI')}
            className="px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            {risksDict.switchTo} {riskFramework === 'PMI' ? 'ISO 31000' : 'PMI Standard'}
          </button>
        )}
      </div>

      {/* 5x5 Matrix Visualizer (PMI vs ISO 31000) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              {risksDict.matrixTitle}
            </h3>
          </div>
          <button
            onClick={() => setShowMatrixVisual(!showMatrixVisual)}
            className="text-xs text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
          >
            {showMatrixVisual ? risksDict.collapseMatrix : risksDict.expandMatrix}
          </button>
        </div>

        {showMatrixVisual && (
          <div className="pt-2 pb-1 overflow-x-auto">
            <div className="min-w-[620px] max-w-2xl mx-auto">
              <div className="flex">
                {/* Vertical Axis Title */}
                <div className="w-8 flex items-center justify-center">
                  <span className="-rotate-90 text-[11px] font-bold tracking-widest text-slate-500 uppercase whitespace-nowrap">
                    {risksDict.probAxis}
                  </span>
                </div>

                {/* 5x5 Matrix */}
                <div className="flex-1">
                  <div className="grid grid-rows-5 gap-1.5">
                    {[5, 4, 3, 2, 1].map((prob) => (
                      <div key={prob} className="grid grid-cols-5 gap-1.5 items-center">
                        {[1, 2, 3, 4, 5].map((impact) => {
                          const cellScore = prob * impact;
                          const cellItems = risks.filter(
                            (r) =>
                              r.status !== 'Resolved' &&
                              r.probability === prob &&
                              r.impact === impact
                          );

                          let cellStyle = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                          if (cellScore >= 15) {
                            cellStyle = 'bg-rose-50 border-rose-200 text-rose-800';
                          } else if (cellScore >= 8) {
                            cellStyle = 'bg-amber-50 border-amber-200 text-amber-800';
                          }

                          return (
                            <div
                              key={impact}
                              className={`h-14 border rounded p-1 flex flex-col justify-between transition-transform hover:scale-102 ${cellStyle}`}
                            >
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span>P{prob}·I{impact}</span>
                                <span className="font-bold">{cellScore}</span>
                              </div>
                              <div className="flex flex-wrap gap-1 overflow-hidden">
                                {cellItems.map((item) => (
                                  <span
                                    key={item.id}
                                    title={`${item.id}: ${item.description}`}
                                    className={`text-[9px] font-mono font-bold px-1 rounded truncate max-w-full ${
                                      item.category === 'Blocker'
                                        ? 'bg-rose-600 text-white'
                                        : item.category === 'Issue'
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-slate-700 text-white'
                                    }`}
                                  >
                                    {item.id}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Horizontal Axis Title */}
                  <div className="mt-2 text-center text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                    {risksDict.impactAxis}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                  {risksDict.lowRisk}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
                  {risksDict.medRisk}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300 inline-block" />
                  {risksDict.highRisk}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={risksDict.searchPh}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono px-2">{risksDict.typeFilter}</span>
              {(['All', 'Risk', 'Issue', 'Blocker'] as const).map((cat) => {
                const label =
                  cat === 'All'
                    ? risksDict.all
                    : cat === 'Risk'
                    ? risksDict.riskCat
                    : cat === 'Issue'
                    ? risksDict.issueCat
                    : risksDict.blockerCat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      categoryFilter === cat
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono px-2">{risksDict.statusFilter}</span>
              {(['All', 'Open', 'Monitoring', 'Resolved'] as const).map((st) => {
                const label =
                  st === 'All'
                    ? risksDict.all
                    : st === 'Open'
                    ? risksDict.openSt
                    : st === 'Monitoring'
                    ? risksDict.monitoringSt
                    : risksDict.resolvedSt;
                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      statusFilter === st
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{risksDict.addManualRisk}</span>
            </button>

            <button
              onClick={() => exportRisksToCSV(risks)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>{risksDict.exportCsv}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3 w-20 font-mono">{risksDict.colId}</th>
                <th className="p-3 w-28">{risksDict.colCat}</th>
                <th className="p-3 min-w-[220px]">{risksDict.colDesc}</th>
                <th className="p-3 w-32">{risksDict.colOwner}</th>
                <th className="p-3 w-20 text-center font-mono">{risksDict.colProb}</th>
                <th className="p-3 w-20 text-center font-mono">{risksDict.colImpact}</th>
                <th className="p-3 w-20 text-center font-mono">{risksDict.colScore}</th>
                <th className="p-3 w-28">{risksDict.colStrategy}</th>
                <th className="p-3 min-w-[240px]">{risksDict.colMitigation}</th>
                <th className="p-3 w-28">{risksDict.colStatus}</th>
                <th className="p-3 w-10 text-center">{risksDict.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400 text-xs">
                    {risksDict.emptyMatch}
                  </td>
                </tr>
              ) : (
                filteredRisks.map((risk) => {
                  const scoreConfig = getScoreColor(risk.score);
                  const isLockedProb = risk.category === 'Blocker' || risk.category === 'Issue';

                  return (
                    <tr
                      key={risk.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        risk.status === 'Resolved' ? 'bg-slate-50/40 opacity-70' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="p-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {risk.id}
                      </td>

                      {/* Category Badge & Selector */}
                      <td className="p-3">
                        <select
                          value={risk.category}
                          onChange={(e) => {
                            const newCat = e.target.value as RiskCategory;
                            const newP = (newCat === 'Blocker' || newCat === 'Issue') ? 5 : risk.probability;
                            const newScore = calculateScore(newP, risk.impact);
                            onUpdateRisk(risk.id, {
                              category: newCat,
                              probability: newP,
                              score: newScore,
                            });
                          }}
                          className={`font-semibold text-xs border rounded px-1.5 py-1 ${
                            risk.category === 'Blocker'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : risk.category === 'Issue'
                              ? 'bg-orange-50 text-orange-700 border-orange-300'
                              : 'bg-blue-50 text-blue-700 border-blue-300'
                          }`}
                        >
                          <option value="Risk">{risksDict.riskCat}</option>
                          <option value="Issue">{risksDict.issueCat}</option>
                          <option value="Blocker">{risksDict.blockerCat}</option>
                        </select>
                      </td>

                      {/* Description */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={risk.description}
                          onChange={(e) => onUpdateRisk(risk.id, { description: e.target.value })}
                          className="w-full font-medium text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                        />
                        {risk.sourceQuote && (
                          <div className="text-[10px] text-slate-400 italic truncate max-w-sm mt-0.5">
                            "{risk.sourceQuote}"
                          </div>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={risk.owner || ''}
                          placeholder={risksDict.unassignedPh}
                          onChange={(e) =>
                            onUpdateRisk(risk.id, { owner: e.target.value.trim() ? e.target.value : null })
                          }
                          className="w-full text-xs border border-slate-200 rounded px-1.5 py-0.5"
                        />
                      </td>

                      {/* Probability */}
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min={1}
                          max={5}
                          disabled={isLockedProb}
                          value={risk.probability}
                          onChange={(e) => {
                            const p = Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) as any;
                            const newScore = calculateScore(p, risk.impact);
                            onUpdateRisk(risk.id, { probability: p, score: newScore });
                          }}
                          className="w-12 text-center border border-slate-200 rounded px-1 py-0.5 font-mono text-xs disabled:bg-slate-100 disabled:text-slate-500"
                        />
                        {isLockedProb && (
                          <div className="text-[9px] text-rose-600 font-mono">{risksDict.lockedProb}</div>
                        )}
                      </td>

                      {/* Impact */}
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min={1}
                          max={5}
                          value={risk.impact}
                          onChange={(e) => {
                            const imp = Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) as any;
                            const newScore = calculateScore(risk.probability, imp);
                            onUpdateRisk(risk.id, { impact: imp, score: newScore });
                          }}
                          className="w-12 text-center border border-slate-200 rounded px-1 py-0.5 font-mono text-xs"
                        />
                      </td>

                      {/* Auto Calculated Score */}
                      <td className="p-3 text-center">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${scoreConfig.bg}`}
                          title={`Probability: ${risk.probability} × Impact: ${risk.impact}`}
                        >
                          {risk.score}
                        </span>
                      </td>

                      {/* Strategy */}
                      <td className="p-3">
                        <select
                          value={risk.strategy}
                          onChange={(e) =>
                            onUpdateRisk(risk.id, { strategy: e.target.value as RiskStrategy })
                          }
                          className="text-xs border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700"
                        >
                          <option value="Avoid">Avoid</option>
                          <option value="Mitigate">Mitigate</option>
                          <option value="Transfer">Transfer</option>
                          <option value="Accept">Accept</option>
                        </select>
                      </td>

                      {/* Mitigation Plan & AI Verification Badge */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={risk.mitigationPlan}
                          onChange={(e) => onUpdateRisk(risk.id, { mitigationPlan: e.target.value })}
                          className="w-full text-[11px] text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none"
                        />
                        {risk.isMitigationAIProposed && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <button
                              onClick={() => verifyMitigation(risk.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded px-2 py-0.5 transition-colors cursor-pointer"
                              title="Click to accept and verify this AI-proposed mitigation plan"
                            >
                              <Check className="w-3 h-3 text-blue-600" />
                              <span>{risksDict.aiProposedVerify}</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <select
                          value={risk.status}
                          onChange={(e) =>
                            onUpdateRisk(risk.id, { status: e.target.value as any })
                          }
                          className="text-xs border border-slate-200 rounded px-1.5 py-0.5 bg-white font-medium"
                        >
                          <option value="Open">{risksDict.openSt}</option>
                          <option value="Monitoring">{risksDict.monitoringSt}</option>
                          <option value="Resolved">{risksDict.resolvedSt}</option>
                        </select>
                      </td>

                      {/* Delete */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onDeleteRisk(risk.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                          title={risksDict.deleteTitle}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Risk Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm">
                {risksDict.modalTitle}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRisk} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{risksDict.modalCat}</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as RiskCategory)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Risk">Risk ({language === 'es' ? 'Evento Incierto Futuro' : language === 'fr' ? 'Événement Futur Incertain' : 'Future Uncertain Event'})</option>
                    <option value="Issue">Issue ({language === 'es' ? 'Problema Realizado' : language === 'fr' ? 'Problème Réalisé' : 'Realized Problem'})</option>
                    <option value="Blocker">Blocker ({language === 'es' ? 'Impedimento Activo' : language === 'fr' ? 'Empêchement Actif' : 'Active Impediment'})</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{risksDict.modalOwner}</label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus Vance"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{risksDict.modalDesc}</label>
                <textarea
                  rows={2}
                  required
                  placeholder={risksDict.modalDescPh}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{risksDict.probAxis}</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    disabled={newCategory === 'Blocker' || newCategory === 'Issue'}
                    value={newCategory === 'Blocker' || newCategory === 'Issue' ? 5 : newProb}
                    onChange={(e) => setNewProb(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono text-center disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{risksDict.impactAxis}</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={newImpact}
                    onChange={(e) => setNewImpact(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) as any)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{risksDict.modalStrategy}</label>
                  <select
                    value={newStrategy}
                    onChange={(e) => setNewStrategy(e.target.value as RiskStrategy)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Avoid">Avoid</option>
                    <option value="Mitigate">Mitigate</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Accept">Accept</option>
                    {riskFramework === 'PMI' && (
                      <option value="Escalate">Escalate (PMI PMBOK®)</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{risksDict.modalMitigation}</label>
                <input
                  type="text"
                  placeholder={risksDict.modalMitigationPh}
                  value={newMitigation}
                  onChange={(e) => setNewMitigation(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  {risksDict.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium cursor-pointer"
                >
                  {risksDict.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
