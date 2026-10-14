import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  AlertCircle,
  Clock,
  HelpCircle,
  Plus,
  Download,
  Search,
  Filter,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { ActionItem, ActionStatus, EpistemicStatus, Language } from '../types';
import { isOverdue, isDueSoon, exportActionsToCSV, generateNextId } from '../utils/projectUtils';

interface TabActionsProps {
  actions: ActionItem[];
  referenceDate: string;
  language?: Language;
  onUpdateAction: (id: string, updates: Partial<ActionItem>) => void;
  onAddAction: (action: ActionItem) => void;
  onDeleteAction: (id: string) => void;
}

export const TabActions: React.FC<TabActionsProps> = ({
  actions,
  referenceDate,
  language = 'en',
  onUpdateAction,
  onAddAction,
  onDeleteAction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ActionStatus>('All');
  const [epistemicFilter, setEpistemicFilter] = useState<'All' | EpistemicStatus>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const actionsDict = {
    en: {
      kpiTotal: 'Total Actions',
      kpiCompleted: 'Completed',
      kpiOverdue: 'Overdue',
      kpiDueSoon: 'Due in 7 Days',
      kpiClarification: 'Needs Clarification',
      searchPlaceholder: 'Search actions by ID, title, owner...',
      filterStatus: 'Status:',
      filterEpistemic: 'Epistemic:',
      all: 'All',
      notStarted: 'Not Started',
      inProgress: 'In Progress',
      blocked: 'Blocked',
      completed: 'Completed',
      confirmed: 'Confirmed',
      needsClarification: 'Needs Clarification',
      aiSuggestion: 'AI Suggestion',
      addManualAction: 'Add Manual Action',
      exportCsv: 'Export CSV',
      colId: 'ID',
      colTitle: 'Action Item Title',
      colOwner: 'Owner',
      colDueDate: 'Due Date',
      colStatus: 'Status',
      colEpistemic: 'Epistemic Status',
      colDependencies: 'Dependencies & Notes',
      colAction: 'Action',
      unassignedPlaceholder: 'Unassigned',
      quoteLabel: 'Quote:',
      overdueVs: 'Overdue vs',
      dueIn7Days: 'Due in 7 days',
      deleteTitle: 'Delete action item',
      emptyMatch: 'No action items found matching your filters.',
      modalTitle: 'Add New Manual Action Item',
      modalDeliverable: 'Action Title / Deliverable *',
      modalDeliverablePh: 'e.g. Conduct laser measurement of track radius',
      modalOwner: 'Owner',
      modalOwnerNote: '(Leave blank if unassigned)',
      modalDueDate: 'Due Date',
      modalDueDateNote: '(Leave blank if indefinite)',
      modalInitialStatus: 'Initial Status',
      modalDependencies: 'Dependencies',
      modalDependenciesPh: 'e.g. Anchor bolt verification',
      modalValidationNotes: 'Validation Notes',
      modalValidationNotesPh: 'e.g. Direct instruction from site director',
      cancelBtn: 'Cancel',
      saveBtn: 'Save Action',
    },
    es: {
      kpiTotal: 'Total de Acciones',
      kpiCompleted: 'Completadas',
      kpiOverdue: 'Atrasadas',
      kpiDueSoon: 'Vence en 7 Días',
      kpiClarification: 'Requiere Aclaración',
      searchPlaceholder: 'Buscar acciones por ID, título, responsable...',
      filterStatus: 'Estado:',
      filterEpistemic: 'Certeza:',
      all: 'Todos',
      notStarted: 'No Iniciada',
      inProgress: 'En Progreso',
      blocked: 'Bloqueada',
      completed: 'Completada',
      confirmed: 'Confirmado',
      needsClarification: 'Requiere Aclaración',
      aiSuggestion: 'Sugerencia IA',
      addManualAction: 'Agregar Acción Manual',
      exportCsv: 'Exportar CSV',
      colId: 'ID',
      colTitle: 'Título y Entregable de la Acción',
      colOwner: 'Responsable',
      colDueDate: 'Fecha Límite',
      colStatus: 'Estado',
      colEpistemic: 'Certeza Epistémica',
      colDependencies: 'Dependencias y Notas',
      colAction: 'Acción',
      unassignedPlaceholder: 'Sin asignar',
      quoteLabel: 'Cita:',
      overdueVs: 'Vencida respecto a',
      dueIn7Days: 'Vence en 7 días',
      deleteTitle: 'Eliminar acción',
      emptyMatch: 'No se encontraron acciones que coincidan con los filtros.',
      modalTitle: 'Agregar Nueva Acción Manual',
      modalDeliverable: 'Título de la Acción / Entregable *',
      modalDeliverablePh: 'ej. Realizar medición láser del radio de la vía',
      modalOwner: 'Responsable',
      modalOwnerNote: '(Dejar vacío si no está asignado)',
      modalDueDate: 'Fecha Límite',
      modalDueDateNote: '(Dejar vacío si es indefinida)',
      modalInitialStatus: 'Estado Inicial',
      modalDependencies: 'Dependencias',
      modalDependenciesPh: 'ej. Verificación de pernos de anclaje',
      modalValidationNotes: 'Notas de Validación',
      modalValidationNotesPh: 'ej. Instrucción directa del director de obra',
      cancelBtn: 'Cancelar',
      saveBtn: 'Guardar Acción',
    },
    fr: {
      kpiTotal: 'Total des Actions',
      kpiCompleted: 'Terminées',
      kpiOverdue: 'En Retard',
      kpiDueSoon: 'Échéance sous 7 Jours',
      kpiClarification: 'Nécessite Clarification',
      searchPlaceholder: 'Rechercher par ID, titre, responsable...',
      filterStatus: 'Statut :',
      filterEpistemic: 'Certitude :',
      all: 'Tous',
      notStarted: 'Non Commencée',
      inProgress: 'En Cours',
      blocked: 'Bloquée',
      completed: 'Terminée',
      confirmed: 'Confirmé',
      needsClarification: 'Nécessite Clarification',
      aiSuggestion: 'Suggestion IA',
      addManualAction: 'Ajouter une Action Manuelle',
      exportCsv: 'Exporter CSV',
      colId: 'ID',
      colTitle: 'Titre de l\'Action et Livrable',
      colOwner: 'Responsable',
      colDueDate: 'Date Limite',
      colStatus: 'Statut',
      colEpistemic: 'Certitude Épistémique',
      colDependencies: 'Dépendances et Notes',
      colAction: 'Action',
      unassignedPlaceholder: 'Non assigné',
      quoteLabel: 'Citation :',
      overdueVs: 'En retard par rapport au',
      dueIn7Days: 'Échéance sous 7 jours',
      deleteTitle: 'Supprimer l\'action',
      emptyMatch: 'Aucune action trouvée correspondant aux filtres.',
      modalTitle: 'Ajouter une Nouvelle Action Manuelle',
      modalDeliverable: 'Titre de l\'Action / Livrable *',
      modalDeliverablePh: 'ex. Mesure laser du rayon de courbure',
      modalOwner: 'Responsable',
      modalOwnerNote: '(Laisser vide si non assigné)',
      modalDueDate: 'Date Limite',
      modalDueDateNote: '(Laisser vide si indéfinie)',
      modalInitialStatus: 'Statut Initial',
      modalDependencies: 'Dépendances',
      modalDependenciesPh: 'ex. Vérification des boulons d\'ancrage',
      modalValidationNotes: 'Notes de Validation',
      modalValidationNotesPh: 'ex. Instruction directe du directeur de chantier',
      cancelBtn: 'Annuler',
      saveBtn: 'Enregistrer l\'Action',
    },
  }[language];

  // New action modal form state
  const [newTitle, setNewTitle] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newStatus, setNewStatus] = useState<ActionStatus>('Not Started');
  const [newDependencies, setNewDependencies] = useState('None');
  const [newNotes, setNewNotes] = useState('');

  // KPIs
  const total = actions.length;
  const completed = actions.filter((a) => a.status === 'Completed').length;
  const overdue = actions.filter((a) => isOverdue(a.dueDate, referenceDate, a.status)).length;
  const dueSoon = actions.filter((a) => isDueSoon(a.dueDate, referenceDate, a.status)).length;
  const needsClarification = actions.filter((a) => a.epistemicStatus === 'Needs Clarification').length;

  // Filtered list
  const filteredActions = useMemo(() => {
    return actions.filter((action) => {
      const matchesSearch =
        action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (action.owner && action.owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
        action.dependencies.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || action.status === statusFilter;
      const matchesEpistemic = epistemicFilter === 'All' || action.epistemicStatus === epistemicFilter;

      return matchesSearch && matchesStatus && matchesEpistemic;
    });
  }, [actions, searchQuery, statusFilter, epistemicFilter]);

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const nextId = generateNextId('ACT', actions.map((a) => a.id));
    const epistemicStatus: EpistemicStatus =
      !newOwner.trim() || !newDueDate ? 'Needs Clarification' : 'Confirmed';

    onAddAction({
      id: nextId,
      title: newTitle.trim(),
      owner: newOwner.trim() ? newOwner.trim() : null,
      dueDate: newDueDate || null,
      status: newStatus,
      dependencies: newDependencies.trim() || 'None',
      epistemicStatus,
      validationNotes: newNotes.trim() ? newNotes.trim() : (!newOwner.trim() || !newDueDate ? 'Missing owner or due date.' : null),
      sourceQuote: 'Manually logged by Project Coordinator.',
      updatedAt: referenceDate,
    });

    setNewTitle('');
    setNewOwner('');
    setNewDueDate('');
    setNewStatus('Not Started');
    setNewDependencies('None');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            {actionsDict.kpiTotal}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">{total}</span>
            <CheckSquare className="w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider block">
            {actionsDict.kpiCompleted}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
              {completed} <span className="text-xs font-normal text-slate-400">({total ? Math.round((completed / total) * 100) : 0}%)</span>
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-rose-600 uppercase tracking-wider block">
            {actionsDict.kpiOverdue}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-rose-700 tabular-nums">{overdue}</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <span className="text-[11px] font-medium text-amber-600 uppercase tracking-wider block">
            {actionsDict.kpiDueSoon}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-amber-700 tabular-nums">{dueSoon}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-medium text-amber-700 uppercase tracking-wider block">
            {actionsDict.kpiClarification}
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-amber-800 tabular-nums">{needsClarification}</span>
            <HelpCircle className="w-4 h-4 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Action Controls & Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative min-w-[240px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={actionsDict.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono px-2">{actionsDict.filterStatus}</span>
              {(['All', 'Not Started', 'In Progress', 'Blocked', 'Completed'] as const).map((st) => {
                const label =
                  st === 'All'
                    ? actionsDict.all
                    : st === 'Not Started'
                    ? actionsDict.notStarted
                    : st === 'In Progress'
                    ? actionsDict.inProgress
                    : st === 'Blocked'
                    ? actionsDict.blocked
                    : actionsDict.completed;
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

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-mono px-2">{actionsDict.filterEpistemic}</span>
              {(['All', 'Confirmed', 'Needs Clarification', 'AI Suggestion'] as const).map((ep) => {
                const label =
                  ep === 'All'
                    ? actionsDict.all
                    : ep === 'Confirmed'
                    ? actionsDict.confirmed
                    : ep === 'Needs Clarification'
                    ? actionsDict.needsClarification
                    : actionsDict.aiSuggestion;
                return (
                  <button
                    key={ep}
                    onClick={() => setEpistemicFilter(ep)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      epistemicFilter === ep
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
              <span>{actionsDict.addManualAction}</span>
            </button>

            <button
              onClick={() => exportActionsToCSV(actions)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              title="Download Actions Register as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>{actionsDict.exportCsv}</span>
            </button>
          </div>
        </div>

        {/* Action Table */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="p-3 w-20 font-mono">{actionsDict.colId}</th>
                <th className="p-3 min-w-[240px]">{actionsDict.colTitle}</th>
                <th className="p-3 w-36">{actionsDict.colOwner}</th>
                <th className="p-3 w-36 font-mono">{actionsDict.colDueDate}</th>
                <th className="p-3 w-32">{actionsDict.colStatus}</th>
                <th className="p-3 w-36">{actionsDict.colEpistemic}</th>
                <th className="p-3 min-w-[160px]">{actionsDict.colDependencies}</th>
                <th className="p-3 w-12 text-center">{actionsDict.colAction}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    {actionsDict.emptyMatch}
                  </td>
                </tr>
              ) : (
                filteredActions.map((action) => {
                  const overdueFlag = isOverdue(action.dueDate, referenceDate, action.status);
                  const dueSoonFlag = isDueSoon(action.dueDate, referenceDate, action.status);
                  const missingOwner = !action.owner;
                  const missingDate = !action.dueDate;

                  return (
                    <tr
                      key={action.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        overdueFlag
                          ? 'bg-rose-50/30'
                          : action.status === 'Completed'
                          ? 'bg-slate-50/30 opacity-75'
                          : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="p-3 font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {action.id}
                      </td>

                      {/* Title */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={action.title}
                          onChange={(e) => onUpdateAction(action.id, { title: e.target.value })}
                          className={`w-full font-medium text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:outline-none px-1 py-0.5 rounded ${
                            action.status === 'Completed' ? 'line-through text-slate-500' : ''
                          }`}
                        />
                        {action.sourceQuote && (
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-sm mt-0.5 px-1">
                            {actionsDict.quoteLabel} "{action.sourceQuote}"
                          </div>
                        )}
                      </td>

                      {/* Owner */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={action.owner || ''}
                          placeholder={actionsDict.unassignedPlaceholder}
                          onChange={(e) => {
                            const val = e.target.value.trim() ? e.target.value : null;
                            const newEp =
                              !val || !action.dueDate ? 'Needs Clarification' : 'Confirmed';
                            onUpdateAction(action.id, { owner: val, epistemicStatus: newEp });
                          }}
                          className={`w-full text-xs border rounded px-1.5 py-0.5 ${
                            missingOwner
                              ? 'border-amber-300 bg-amber-50/60 text-amber-800 placeholder-amber-400 font-medium'
                              : 'border-slate-200 text-slate-800'
                          }`}
                        />
                      </td>

                      {/* Due Date with Overdue/Due Soon formatting */}
                      <td className="p-3 font-mono">
                        <div className="space-y-0.5">
                          <input
                            type="date"
                            value={action.dueDate || ''}
                            onChange={(e) => {
                              const val = e.target.value || null;
                              const newEp =
                                !action.owner || !val ? 'Needs Clarification' : 'Confirmed';
                              onUpdateAction(action.id, { dueDate: val, epistemicStatus: newEp });
                            }}
                            className={`w-full text-xs border rounded px-1.5 py-0.5 ${
                              overdueFlag
                                ? 'border-rose-300 bg-rose-50 text-rose-800 font-bold'
                                : dueSoonFlag
                                ? 'border-amber-300 bg-amber-50 text-amber-800'
                                : missingDate
                                ? 'border-amber-300 bg-amber-50 text-amber-800'
                                : 'border-slate-200 text-slate-800'
                            }`}
                          />
                          {overdueFlag && (
                            <span className="text-[10px] text-rose-600 font-sans block font-semibold">
                              {actionsDict.overdueVs} {referenceDate}
                            </span>
                          )}
                          {dueSoonFlag && (
                            <span className="text-[10px] text-amber-600 font-sans block font-medium">
                              {actionsDict.dueIn7Days}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <select
                          value={action.status}
                          onChange={(e) =>
                            onUpdateAction(action.id, { status: e.target.value as ActionStatus })
                          }
                          className={`text-xs font-medium border rounded px-2 py-1 bg-white ${
                            action.status === 'Completed'
                              ? 'text-emerald-700 border-emerald-300 bg-emerald-50/40'
                              : action.status === 'Blocked'
                              ? 'text-rose-700 border-rose-300 bg-rose-50/40'
                              : action.status === 'In Progress'
                              ? 'text-blue-700 border-blue-300 bg-blue-50/40'
                              : 'text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="Not Started">{actionsDict.notStarted}</option>
                          <option value="In Progress">{actionsDict.inProgress}</option>
                          <option value="Blocked">{actionsDict.blocked}</option>
                          <option value="Completed">{actionsDict.completed}</option>
                        </select>
                      </td>

                      {/* Epistemic Status */}
                      <td className="p-3">
                        <select
                          value={action.epistemicStatus}
                          onChange={(e) =>
                            onUpdateAction(action.id, {
                              epistemicStatus: e.target.value as EpistemicStatus,
                            })
                          }
                          className="text-xs border border-slate-200 rounded px-1.5 py-0.5 bg-white text-slate-700"
                        >
                          <option value="Confirmed">{actionsDict.confirmed}</option>
                          <option value="Needs Clarification">{actionsDict.needsClarification}</option>
                          <option value="AI Suggestion">{actionsDict.aiSuggestion}</option>
                        </select>
                      </td>

                      {/* Dependencies & Validation Notes */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={action.dependencies}
                          placeholder={actionsDict.modalDependencies}
                          onChange={(e) =>
                            onUpdateAction(action.id, { dependencies: e.target.value })
                          }
                          className="w-full text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:outline-none text-[11px]"
                        />
                        {action.validationNotes && (
                          <div className="text-[10px] text-amber-700 bg-amber-50 rounded px-1.5 py-0.5 mt-1 truncate max-w-xs">
                            {action.validationNotes}
                          </div>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => onDeleteAction(action.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                          title={actionsDict.deleteTitle}
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

      {/* Manual Add Action Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-900 text-sm">{actionsDict.modalTitle}</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManual} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  {actionsDict.modalDeliverable}
                </label>
                <input
                  type="text"
                  required
                  placeholder={actionsDict.modalDeliverablePh}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {actionsDict.modalOwner} <span className="text-slate-400 font-normal">{actionsDict.modalOwnerNote}</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Carlos Mendez"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    {actionsDict.modalDueDate} <span className="text-slate-400 font-normal">{actionsDict.modalDueDateNote}</span>
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{actionsDict.modalInitialStatus}</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ActionStatus)}
                    className="w-full border border-slate-300 rounded-lg p-2 bg-white"
                  >
                    <option value="Not Started">{actionsDict.notStarted}</option>
                    <option value="In Progress">{actionsDict.inProgress}</option>
                    <option value="Blocked">{actionsDict.blocked}</option>
                    <option value="Completed">{actionsDict.completed}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">{actionsDict.modalDependencies}</label>
                  <input
                    type="text"
                    placeholder={actionsDict.modalDependenciesPh}
                    value={newDependencies}
                    onChange={(e) => setNewDependencies(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">{actionsDict.modalValidationNotes}</label>
                <input
                  type="text"
                  placeholder={actionsDict.modalValidationNotesPh}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  {actionsDict.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium cursor-pointer"
                >
                  {actionsDict.saveBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
