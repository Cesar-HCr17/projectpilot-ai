import React, { useState, useRef } from 'react';
import {
  Calendar,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  Edit2,
  ShieldAlert,
  HelpCircle,
  Info,
  History,
  Camera,
  Layers,
  SlidersHorizontal,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { ProjectState, RAGColor, RiskFramework, Language } from '../types';

interface HeaderProps {
  state: ProjectState;
  activeTab: 'intake' | 'actions' | 'risks' | 'report';
  setActiveTab: (tab: 'intake' | 'actions' | 'risks' | 'report') => void;
  onUpdateProjectMeta: (name: string, description: string, referenceDate: string) => void;
  onLoadAecon: (week: 'week1' | 'week2') => void;
  onLoadRioTinto: (week: 'week1' | 'week2') => void;
  onExportJSON: () => void;
  onImportJSON: (imported: ProjectState) => void;
  onResetWorkspace: () => void;
  onOpenHelp: () => void;
  onOpenInfo: () => void;
  onSelectFramework: (framework: RiskFramework) => void;
  onOpenWelcome: () => void;
  currentVersion: string;
  onOpenSaveSnapshot: () => void;
  onOpenVersionHistory: () => void;
  versionCount: number;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  onOpenSecurityPurge?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  activeTab,
  setActiveTab,
  onUpdateProjectMeta,
  onLoadAecon,
  onLoadRioTinto,
  onExportJSON,
  onImportJSON,
  onResetWorkspace,
  onOpenHelp,
  onOpenInfo,
  onSelectFramework,
  onOpenWelcome,
  currentVersion,
  onOpenSaveSnapshot,
  onOpenVersionHistory,
  versionCount,
  language,
  onSelectLanguage,
  onOpenSecurityPurge,
}) => {
  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [editName, setEditName] = useState(state.projectName);
  const [editDesc, setEditDesc] = useState(state.projectDescription);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveMeta = () => {
    onUpdateProjectMeta(editName, editDesc, state.referenceDate);
    setIsEditingMeta(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.actions && parsed.risks) {
          onImportJSON(parsed);
        } else {
          alert('Invalid project file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const ragColorBadge: Record<RAGColor, string> = {
    RED: 'text-rose-700 bg-rose-50 border-rose-200',
    AMBER: 'text-amber-700 bg-amber-50 border-amber-200',
    GREEN: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  };

  const toggleFramework = () => {
    onSelectFramework(state.riskFramework === 'PMI' ? 'ISO31000' : 'PMI');
  };

  const tabDict = {
    en: {
      intake: '1. Intake Gate',
      actions: '2. Action Tracker',
      risks: '3. Risk & Issues',
      report: '4. Status Report',
      saveSnapshot: 'Save Snapshot',
      history: 'History',
      setup: 'Setup & Features',
      currentVersion: 'Current:',
      refDate: 'Ref Date:',
      simulations: 'Simulations:',
      export: 'Export',
      import: 'Import',
      riskBadge: 'Risk:',
      govBadge: 'Gov: PMI Standard',
      projectPlaceholder: 'Project name',
      descPlaceholder: 'Brief description',
      exportTitle: 'Export complete project state to JSON file',
      importTitle: 'Import project JSON file',
      resetTitle: 'Reset workspace to default empty state',
      saveBaselineTitle: 'Save a version snapshot baseline',
      historyTitle: 'View version snapshot history & restore baselines',
      helpTitle: 'Help & About ProjectPilot AI',
      infoTitle: 'App Info & Support',
      setupTitle: 'Features, instructions & framework selection',
      securityPurge: 'Security Purge',
      securityPurgeTitle: 'Double-authenticated permanent purge of all user data & uploads (preserves factory demos)',
    },
    es: {
      intake: '1. Recepción y Validación',
      actions: '2. Seguimiento de Acciones',
      risks: '3. Riesgos y Problemas',
      report: '4. Informe de Estado',
      saveSnapshot: 'Guardar Versión',
      history: 'Historial',
      setup: 'Instrucciones y Ajustes',
      currentVersion: 'Actual:',
      refDate: 'Fecha Ref:',
      simulations: 'Simulaciones:',
      export: 'Exportar',
      import: 'Importar',
      riskBadge: 'Riesgo:',
      govBadge: 'Gob: Norma PMI',
      projectPlaceholder: 'Nombre del proyecto',
      descPlaceholder: 'Descripción breve',
      exportTitle: 'Exportar estado completo del proyecto a archivo JSON',
      importTitle: 'Importar archivo JSON de proyecto',
      resetTitle: 'Restablecer espacio de trabajo al estado inicial',
      saveBaselineTitle: 'Guardar una línea base de versión',
      historyTitle: 'Ver historial de versiones y restaurar líneas base',
      helpTitle: 'Ayuda y Guía de Gobernanza',
      infoTitle: 'Información y Soporte de la Aplicación',
      setupTitle: 'Características, instrucciones y selección de marco',
      securityPurge: 'Purga de Seguridad',
      securityPurgeTitle: 'Purga con doble autenticación de todos los datos y archivos del usuario (conserva demos del sistema)',
    },
    fr: {
      intake: '1. Réception et Validation',
      actions: '2. Suivi des Actions',
      risks: '3. Risques et Problèmes',
      report: '4. Rapport d\'État',
      saveSnapshot: 'Enregistrer Version',
      history: 'Historique',
      setup: 'Instructions et Réglages',
      currentVersion: 'Actuelle :',
      refDate: 'Date Réf :',
      simulations: 'Simulations :',
      export: 'Exporter',
      import: 'Importer',
      riskBadge: 'Risque :',
      govBadge: 'Gouv : Norme PMI',
      projectPlaceholder: 'Nom du projet',
      descPlaceholder: 'Brève description',
      exportTitle: 'Exporter l\'état complet du projet au format JSON',
      importTitle: 'Importer un fichier JSON de projet',
      resetTitle: 'Réinitialiser l\'espace de travail à l\'état initial',
      saveBaselineTitle: 'Enregistrer une version de référence',
      historyTitle: 'Voir l\'historique des versions et restaurer les bases',
      helpTitle: 'Aide et Guide de Gouvernance',
      infoTitle: 'Informations et Support de l\'Application',
      setupTitle: 'Fonctionnalités, instructions et sélection du cadre',
      securityPurge: 'Purge de Sécurité',
      securityPurgeTitle: 'Purge sécurisée à double authentification de toutes les données et téléversements (conserve les démos d\'origine)',
    },
  }[language];

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
      {/* Universal Top Bar Contract: 3 zones separated by gap-8 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16">
          {/* Zone 1: Single text element wordmark + Framework indicators */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenWelcome}
              className="flex items-center gap-2 group text-left cursor-pointer"
              title={tabDict.setupTitle}
            >
              <span className="font-bold text-lg tracking-tight text-slate-900 whitespace-nowrap group-hover:text-blue-600 transition-colors">
                ProjectPilot<span className="text-blue-600">.AI</span>
              </span>
            </button>

            {/* Risk Framework Badge with Quick Toggle */}
            <button
              type="button"
              onClick={toggleFramework}
              title={`Active risk framework is ${state.riskFramework === 'PMI' ? 'PMI PMBOK®' : 'ISO 31000'}. Click to toggle.`}
              className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                state.riskFramework === 'PMI'
                  ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span>{tabDict.riskBadge}</span>
              <strong className="font-bold">{state.riskFramework === 'PMI' ? 'PMI Standard' : 'ISO 31000'}</strong>
            </button>

            <span className="hidden md:inline-block text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">
              {tabDict.govBadge}
            </span>
          </div>

          {/* Zone 2: Clean single-line navigation tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('intake')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'intake'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tabDict.intake}
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'actions'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tabDict.actions}
              <span className="font-mono text-xs opacity-75">({state.actions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('risks')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'risks'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tabDict.risks}
              <span className="font-mono text-xs opacity-75">({state.risks.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'report'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tabDict.report}
              <span className={`text-[10px] font-mono px-1 rounded uppercase ${ragColorBadge[state.ragAssessment.status]}`}>
                {state.ragAssessment.status}
              </span>
            </button>
          </nav>

          {/* Zone 3: Primary Status Indicator & Info/Help/Setup & Snapshot Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Globe Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors shadow-2xs cursor-pointer"
                title="Change language / Cambiar idioma / Changer de langue"
                aria-label="Language selector"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {language === 'en' ? 'English' : language === 'es' ? 'Español' : 'Français'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangDropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 text-xs animate-fade-in"
                  onMouseLeave={() => setIsLangDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      onSelectLanguage('en');
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      language === 'en' ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onSelectLanguage('es');
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      language === 'es' ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>Español</span>
                    {language === 'es' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => {
                      onSelectLanguage('fr');
                      setIsLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      language === 'fr' ? 'font-bold text-blue-700 bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>Français</span>
                    {language === 'fr' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Save Snapshot Button */}
            <button
              onClick={onOpenSaveSnapshot}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:text-blue-700 border border-slate-300 hover:border-blue-400 rounded-md transition-colors shadow-2xs cursor-pointer"
              title={tabDict.saveBaselineTitle}
            >
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              <span>{tabDict.saveSnapshot}</span>
            </button>

            {/* View History Button */}
            <button
              onClick={onOpenVersionHistory}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              title={tabDict.historyTitle}
              aria-label={tabDict.history}
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{tabDict.history}</span>
              {versionCount > 0 && (
                <span className="text-[10px] font-mono bg-blue-100 text-blue-700 px-1 rounded font-semibold">
                  {versionCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenWelcome}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors border border-slate-200 cursor-pointer"
              title={tabDict.setupTitle}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>{tabDict.setup}</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`text-xs font-semibold px-2.5 py-1 rounded border whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${ragColorBadge[state.ragAssessment.status]}`}
              title={language === 'es' ? 'Ver informe de estado semanal' : language === 'fr' ? 'Voir le rapport d\'état hebdomadaire' : 'Click to view weekly status report'}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>RAG: {state.ragAssessment.status}</span>
            </button>

            {/* Top Header Far-Right Icon Buttons: HelpCircle and Info */}
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <button
              onClick={onOpenHelp}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title={tabDict.helpTitle}
              aria-label={tabDict.helpTitle}
            >
              <HelpCircle className="w-4 h-4 text-slate-600 hover:text-blue-600" />
            </button>
            <button
              onClick={onOpenInfo}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title={tabDict.infoTitle}
              aria-label={tabDict.infoTitle}
            >
              <Info className="w-4 h-4 text-slate-600 hover:text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Project Sub-Toolbar: Context controls, Demos, Import/Export */}
      <div className="border-t border-slate-100 bg-slate-50/75 px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left: Editable Project Title & Description with Current Version Badge */}
          <div className="flex items-center gap-3 min-w-[280px] max-w-xl">
            {isEditingMeta ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-900 w-44 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={tabDict.projectPlaceholder}
                />
                <input
                  type="text"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-600 flex-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder={tabDict.descPlaceholder}
                />
                <button
                  onClick={handleSaveMeta}
                  className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                  title="Save project metadata"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <span className="font-semibold text-slate-900">{state.projectName}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-200/80 text-slate-700 border border-slate-300">
                  {tabDict.currentVersion} {currentVersion}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 truncate max-w-xs">{state.projectDescription}</span>
                <button
                  onClick={() => {
                    setEditName(state.projectName);
                    setEditDesc(state.projectDescription);
                    setIsEditingMeta(true);
                  }}
                  className="text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Edit project details"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Right: Reference Date Picker + Demos + Data Tools */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Reference Date Picker */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded px-2 py-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">{tabDict.refDate}</span>
              <input
                type="date"
                value={state.referenceDate}
                onChange={(e) => onUpdateProjectMeta(state.projectName, state.projectDescription, e.target.value)}
                className="bg-transparent text-slate-800 font-mono text-xs focus:outline-none cursor-pointer"
              />
            </div>

            {/* Portfolio Simulations: Aecon & Rio Tinto */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono hidden sm:inline">
                {tabDict.simulations}
              </span>

              {/* Aecon Group */}
              <div className="flex items-center gap-1 border-r border-slate-200 pr-1.5">
                <button
                  onClick={() => onLoadAecon('week1')}
                  className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                  title="AOTH Radar Program (Aecon IPD) - Week 1 Kickoff"
                >
                  Aecon W1
                </button>
                <button
                  onClick={() => onLoadAecon('week2')}
                  className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-900 hover:bg-blue-200 transition-colors"
                  title="AOTH Radar Program (Aecon IPD) - Week 2 Updates & Diffs"
                >
                  Aecon W2
                </button>
              </div>

              {/* Rio Tinto Group */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onLoadRioTinto('week1')}
                  className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
                  title="Rincón Lithium Project (Rio Tinto) - Week 1 Kickoff"
                >
                  Rio Tinto W1
                </button>
                <button
                  onClick={() => onLoadRioTinto('week2')}
                  className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors"
                  title="Rincón Lithium Project (Rio Tinto) - Week 2 Updates & Diffs"
                >
                  Rio Tinto W2
                </button>
              </div>
            </div>

            {/* Utility Actions */}
            <div className="h-4 w-px bg-slate-200 mx-0.5" />
            <button
              onClick={onExportJSON}
              className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded"
              title={tabDict.exportTitle}
            >
              <Download className="w-3 h-3 text-slate-500" />
              <span>{tabDict.export}</span>
            </button>
            <label className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded cursor-pointer" title={tabDict.importTitle}>
              <Upload className="w-3 h-3 text-slate-500" />
              <span>{tabDict.import}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              onClick={onResetWorkspace}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
              title={tabDict.resetTitle}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {onOpenSecurityPurge && (
              <button
                onClick={onOpenSecurityPurge}
                className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded font-semibold text-xs transition-colors shadow-2xs cursor-pointer ml-1"
                title={tabDict.securityPurgeTitle}
              >
                <ShieldAlert className="w-3 h-3 text-rose-600" />
                <span className="hidden md:inline">{tabDict.securityPurge}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
