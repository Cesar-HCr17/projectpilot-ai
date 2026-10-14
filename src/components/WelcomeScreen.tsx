import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Workflow,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Sliders,
  Layers,
  FileText,
  Shield,
  Briefcase,
  History,
  AlertTriangle,
  CheckSquare,
  Globe,
  Info,
  Lock,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import { RiskFramework, Language } from '../types';
import { aeconScenario, rioTintoScenario } from '../mockData';

interface WelcomeScreenProps {
  currentFramework: RiskFramework;
  onSelectFramework: (framework: RiskFramework) => void;
  onLaunchSimulation: (scenarioKey: 'aecon' | 'rioTinto' | 'clean', week: 'week1' | 'week2') => void;
  onClose?: () => void;
  onBackToWelcome: () => void;
  hasExistingData?: boolean;
  activeProjectName?: string;
  language?: Language;
  onSelectLanguage?: (lang: Language) => void;
  currentVersion?: string;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  currentFramework,
  onSelectFramework,
  onLaunchSimulation,
  onClose,
  onBackToWelcome,
  hasExistingData,
  activeProjectName,
  language = 'en',
  onSelectLanguage,
  currentVersion = 'v2.7',
}) => {
  const [selectedScenario, setSelectedScenario] = useState<'aecon' | 'rioTinto' | 'clean'>('aecon');
  const [selectedWeek, setSelectedWeek] = useState<'week1' | 'week2'>('week1');

  const handleLaunch = () => {
    onLaunchSimulation(selectedScenario, selectedWeek);
  };

  const labels = {
    en: {
      tagline: 'Enterprise Governance Staging Gate · Page 2 of 3',
      pageTitle: 'General Features & Operating Instructions',
      pageSubtitle:
        'Review system capabilities, enterprise guardrails, and project controls before entering the active workspace. Everything is designed for zero-hallucination industrial project governance.',
      creatorRole: 'Industrial Engineer & Risk Management Professional',
      coreGovTitle: 'Core Project Governance',
      coreGovDesc: 'PMI Standard (Action Tracker, Issue Log, Reporting)',
      featuresHeader: 'Core System Capabilities & Instructions',
      step1Title: '1. Intake Staging Gate (Zero Hallucination)',
      step1Desc:
        'Paste raw minutes or field logs. The AI extracts proposed actions, risks, and decisions with mandatory verbatim quotes. Human coordinators inspect, edit, or reject items before committing. Includes 15,000-char context safety, PII pre-flight verification, and 10-second instant undo.',
      step2Title: '2. PMI Action Item Tracker',
      step2Desc:
        'Manage accountability with strict owner assignments. Automatically calculates deadline statuses (Pending, In Progress, Complete, Overdue based on the project reference date). Closed items move to a secure audit register.',
      step3Title: '3. Risk & Issues Register',
      step3Desc:
        'Categorize proactive threats and realized issues. Assign mitigation treatments (Avoid, Mitigate, Transfer, Accept, Escalate) with qualitative matrix scoring and clear target closure dates.',
      step4Title: '4. Executive Status Report & RAG Logic',
      step4Desc:
        'Calculates objective project health (Red/Amber/Green) through automated governance criteria. Generates grounded executive narratives citing live records with exportable JSON and clean print layouts.',
      step5Title: '5. Version Control & Baseline Snapshots',
      step5Desc:
        `Track project history from current baseline ${currentVersion}. Save minor iterations (e.g., ${currentVersion} → v2.8) or major milestone releases (e.g., v3.0) with change notes, and restore any previous baseline in one click.`,
      govDirectiveBadge: 'MANDATORY GOVERNANCE DIRECTIVE',
      govDirectiveTitle: 'Project Standards & Risk Framework Decision',
      govDirectiveNote:
        'All project controls, action tracking, deliverables, issue management, and executive reporting strictly follow the PMI Standard. Only the risk management framework is configurable: decide below whether your project operates under PMI PMBOK® or ISO 31000 regarding risks.',
      selectFrameworkTitle: 'Select Your Risk Framework',
      selectFrameworkDesc:
        'All project management follows PMI. Choose how risk matrices and probability/impact scoring are evaluated:',
      pmiTitle: 'PMI Standard (PMBOK® Guide)',
      pmiSub: 'Recommended for standard EPC & industrial projects',
      pmiBullets: [
        'Qualitative Probability & Impact Matrix',
        'Strategies: Escalate, Mitigate, Avoid, Transfer, Accept',
        'Formal Realized Issue vs. Threat Governance',
      ],
      isoTitle: 'ISO 31000 Standard',
      isoSub: 'International enterprise risk management framework',
      isoBullets: [
        '5×5 Probability × Impact Heatmap Grid',
        'Risk treatment plans & residual risk exposure',
        'Calibrated Low (1–6), Medium (8–12), High (15–25) severity thresholds',
      ],
      selectScenarioTitle: 'Choose Starting Scenario or Clean Workspace',
      selectScenarioDesc:
        'Preload complex industrial engineering scenarios or start with an empty register:',
      aeconTitle: 'Aecon IPD Joint Venture',
      aeconDesc: 'Civil / Defense infrastructure scenario with site IT requisitions, security log protocols, and subgrade compaction diffs.',
      rioTintoTitle: 'Rio Tinto Lithium Project',
      rioTintoDesc: 'High-altitude lithium extraction plant scenario featuring ruggedized tablets, UK membrane customs delays, and schedule conflicts.',
      cleanTitle: 'Clean Blank Register',
      cleanDesc: 'Start with an empty project register ready for your custom title, raw meeting minutes, and custom actions.',
      backToWelcomeBtn: '← Back to Welcome & Language',
      enterWorkspaceBtn: 'Enter Project Workspace',
      returnWorkspaceBtn: 'Return to Active Workspace',
      phaseLabel: 'Select Iteration Phase:',
      week1Label: 'Week 1 (Kickoff Minutes & Intake)',
      week2Label: 'Week 2 (Progress Updates, Blocker & Diffs)',
    },
    es: {
      tagline: 'Compuerta de Gobernanza Empresarial · Página 2 de 3',
      pageTitle: 'Características Generales e Instrucciones de Operación',
      pageSubtitle:
        'Revise las capacidades del sistema, controles operativos y compuerta de validación antes de ingresar al espacio de trabajo activo. Diseñado para gobernanza de ingeniería con cero alucinaciones.',
      creatorRole: 'Ingeniero Industrial & Especialista en Gestión del Riesgo',
      coreGovTitle: 'Gobernanza Central del Proyecto',
      coreGovDesc: 'Norma PMI (Seguimiento de Acciones, Registro de Incidentes, Informes)',
      featuresHeader: 'Capacidades Centrales e Instrucciones del Sistema',
      step1Title: '1. Compuerta de Recepción y Validación (Cero Alucinaciones)',
      step1Desc:
        'Pegue minutas sin formato o notas de campo. La IA extrae acciones propuestas, riesgos y decisiones con citas textuales obligatorias. Los coordinadores revisan, editan o rechazan antes de confirmar. Incluye límite de 15.000 caracteres, verificación previa de PII y deshacer instantáneo en 10 segundos.',
      step2Title: '2. Seguimiento de Acciones según Norma PMI',
      step2Desc:
        'Garantice la rendición de cuentas con asignación obligatoria de responsables. Calcula automáticamente el estado (Pendiente, En Progreso, Completado, Vencido según la fecha de referencia). Los elementos cerrados se archivan con trazabilidad completa.',
      step3Title: '3. Registro de Riesgos e Incidentes',
      step3Desc:
        'Clasifique amenazas proactivas e incidentes materializados. Asigne estrategias de tratamiento (Evitar, Mitigar, Transferir, Aceptar, Escalar) con matrices cualitativas y fechas objetivo de cierre.',
      step4Title: '4. Informe Ejecutivo de Estado y Lógica RAG',
      step4Desc:
        'Calcula objetivamente el estado del proyecto (Rojo/Ámbar/Verde) mediante reglas automáticas. Redacta narrativas ejecutivas verificables citando registros reales, con exportación a JSON y vista de impresión.',
      step5Title: '5. Control de Versiones y Líneas Base (Snapshots)',
      step5Desc:
        `Gestione el historial del proyecto a partir de la línea base actual ${currentVersion}. Guarde iteraciones menores (ej. ${currentVersion} → v2.8) o versiones principales (ej. v3.0) con notas de cambio y restauración en un clic.`,
      govDirectiveBadge: 'DIRECTIVA OBLIGATORIA DE GOBERNANZA',
      govDirectiveTitle: 'Estándares del Proyecto y Decisión de Marco de Riesgos',
      govDirectiveNote:
        'Todos los controles del proyecto, seguimiento de acciones, entregables, gestión de incidentes e informes ejecutivos se rigen estrictamente bajo el Estándar PMI. Únicamente el marco de gestión de riesgos es configurable: decida a continuación si operará bajo PMI PMBOK® o ISO 31000 respecto a los riesgos.',
      selectFrameworkTitle: 'Seleccione su Marco de Riesgos',
      selectFrameworkDesc:
        'Toda la gestión del proyecto sigue PMI. Elija cómo se evaluarán las matrices de probabilidad e impacto:',
      pmiTitle: 'Norma PMI (Guía PMBOK®)',
      pmiSub: 'Recomendado para proyectos industriales y de ingeniería estándar',
      pmiBullets: [
        'Matriz cualitativa de Severidad (Probabilidad × Impacto)',
        'Estrategias: Escalar, Mitigar, Evitar, Transferir, Aceptar',
        'Gobernanza formal de Amenazas vs. Incidentes Materializados',
      ],
      isoTitle: 'Norma ISO 31000',
      isoSub: 'Marco internacional de gestión del riesgo empresarial',
      isoBullets: [
        'Matriz de mapa de calor 5×5 de Probabilidad e Impacto',
        'Planes de tratamiento y exposición al riesgo residual',
        'Umbrales calibrados: Bajo (1–6), Medio (8–12), Severo (15–25)',
      ],
      selectScenarioTitle: 'Elija Escenario de Simulación o Registro en Blanco',
      selectScenarioDesc:
        'Cargue proyectos reales de ingeniería industrial o comience con un registro limpio:',
      aeconTitle: 'Consorcio Aecon IPD',
      aeconDesc: 'Infraestructura civil y defensa con requisiciones de laptops Toughbook, protocolos de seguridad ACSO y contradicciones de compactación.',
      rioTintoTitle: 'Proyecto de Litio Rio Tinto',
      rioTintoDesc: 'Planta de extracción directa de litio a gran altitud con tablets para terreno, retención aduanera de membranas y conflictos de cronograma.',
      cleanTitle: 'Registro en Blanco',
      cleanDesc: 'Inicie un espacio de trabajo limpio listo para título personalizado y pegado de minutas propias.',
      backToWelcomeBtn: '← Volver a Selección de Idioma',
      enterWorkspaceBtn: 'Entrar al Espacio de Trabajo',
      returnWorkspaceBtn: 'Volver al Espacio Activo',
      phaseLabel: 'Seleccionar Fase de Iteración:',
      week1Label: 'Semana 1 (Minuta Inicial y Recepción)',
      week2Label: 'Semana 2 (Avances, Bloqueos y Diferencias)',
    },
    fr: {
      tagline: 'Porte de Gouvernance d\'Entreprise · Page 2 sur 3',
      pageTitle: 'Fonctionnalités Générales et Instructions d\'Opération',
      pageSubtitle:
        'Découvrez les fonctionnalités clés, les garde-fous d\'entreprise et les contrôles de projet avant d\'accéder à l\'espace de travail. Conçu pour une gouvernance industrielle sans hallucination.',
      creatorRole: 'Ingénieur Industriel & Spécialiste en Gestion des Risques',
      coreGovTitle: 'Gouvernance Centrale du Projet',
      coreGovDesc: 'Norme PMI (Suivi des Actions, Journal des Incidents, Rapports)',
      featuresHeader: 'Capacités Clés et Instructions du Système',
      step1Title: '1. Porte de Validation des Entrées (Zéro Hallucination)',
      step1Desc:
        'Collez vos comptes-rendus bruts. L\'IA extrait les actions, risques et décisions avec citations textuelles obligatoires. Les coordinateurs examinent et valident avant confirmation. Inclut limite de 15 000 caractères, vérification PII et annulation instantanée sous 10 secondes.',
      step2Title: '2. Suivi des Actions selon la Norme PMI',
      step2Desc:
        'Responsabilisation stricte avec attribution obligatoire d\'un responsable. Calcul automatique des échéances (En attente, En cours, Terminé, En retard selon la date de référence). Les tâches terminées sont archivées avec traçabilité.',
      step3Title: '3. Registre des Risques et Incidents',
      step3Desc:
        'Catégorisez menaces proactives et incidents avérés. Définissez les stratégies de traitement (Éviter, Atténuer, Transférer, Accepter, Escalader) avec matrice qualitative et dates cibles.',
      step4Title: '4. Rapport d\'État Exécutif et Logique RAG',
      step4Desc:
        'Calcule l\'état du projet (Rouge/Ambre/Vert) via des critères de gouvernance automatisés. Rédige des synthèses exécutives fiables avec export JSON et impression soignée.',
      step5Title: '5. Contrôle de Versions et Lignes de Base (Snapshots)',
      step5Desc:
        `Suivez l'historique du projet depuis la ligne de base actuelle ${currentVersion}. Enregistrez des itérations mineures (ex. ${currentVersion} → v2.8) ou majeures (ex. v3.0) avec notes de changement et restauration en un clic.`,
      govDirectiveBadge: 'DIRECTIVE OBLIGATOIRE DE GOUVERNANCE',
      govDirectiveTitle: 'Normes de Projet et Choix du Cadre des Risques',
      govDirectiveNote:
        'Tous les contrôles de projet, suivi des actions, livrables, gestion des incidents et rapports exécutifs respectent strictement la Norme PMI. Seul le cadre de gestion des risques est configurable : décidez ci-dessous d\'opérer sous PMI PMBOK® ou ISO 31000 pour les risques.',
      selectFrameworkTitle: 'Sélectionnez Votre Cadre de Risques',
      selectFrameworkDesc:
        'Toute la gestion du projet suit le standard PMI. Choisissez la méthode d\'évaluation des probabilités et impacts :',
      pmiTitle: 'Norme PMI (Guide PMBOK®)',
      pmiSub: 'Recommandé pour les projets industriels standards',
      pmiBullets: [
        'Matrice qualitative de Sévérité (Probabilité × Impact)',
        'Stratégies : Escalader, Atténuer, Éviter, Transférer, Accepter',
        'Gouvernance formelle des Menaces vs. Incidents Réalisés',
      ],
      isoTitle: 'Norme ISO 31000',
      isoSub: 'Cadre international de management des risques d\'entreprise',
      isoBullets: [
        'Grille thermique 5×5 de Probabilité et Impact',
        'Plans de traitement et exposition au risque résiduel',
        'Seuils calibrés : Faible (1–6), Moyen (8–12), Critique (15–25)',
      ],
      selectScenarioTitle: 'Choisissez un Scénario ou un Registre Vierge',
      selectScenarioDesc:
        'Chargez des simulations industrielles réelles ou démarrez avec un registre propre :',
      aeconTitle: 'Consortium Aecon IPD',
      aeconDesc: 'Infrastructures civiles et défense avec réquisitions Toughbook, protocoles de sécurité ACSO et discordances de compactage.',
      rioTintoTitle: 'Projet Lithium Rio Tinto',
      rioTintoDesc: 'Usine d\'extraction directe de lithium en haute altitude avec tablettes de terrain, blocage douanier de membranes et conflits de calendrier.',
      cleanTitle: 'Registre Vierge',
      cleanDesc: 'Démarrez un espace de travail vierge prêt pour votre titre et vos comptes-rendus de réunion.',
      backToWelcomeBtn: '← Retour au Choix de la Langue',
      enterWorkspaceBtn: 'Accéder à l\'Espace de Travail',
      returnWorkspaceBtn: 'Retourner à l\'Espace Actif',
      phaseLabel: 'Sélectionner la Phase d\'Itération :',
      week1Label: 'Semaine 1 (Coup d\'Envoi et Validation)',
      week2Label: 'Semana 2 (Avancements, Blocages et Différences)',
    },
  };

  const t = labels[language] || labels.en;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Bar Wordmark & Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/85 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
              <span>ProjectPilot</span>
              <span className="text-blue-500 font-extrabold">.AI</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400 border border-slate-800 rounded px-2 py-0.5 bg-slate-900 hidden sm:inline">
              {t.tagline}
            </span>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300">
              {currentVersion}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            {/* Language Selector Dropdown / Buttons */}
            {onSelectLanguage && (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                {(['en', 'es', 'fr'] as Language[]).map((lng) => (
                  <button
                    key={lng}
                    onClick={() => onSelectLanguage(lng)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                      language === lng
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lng.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Back to First Screen Button */}
            <button
              onClick={onBackToWelcome}
              className="px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-700/80 flex items-center gap-1 cursor-pointer"
              title="Return to Page 1: Welcome & Language Selection"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.backToWelcomeBtn}</span>
              <span className="md:hidden">Page 1</span>
            </button>

            {onClose && hasExistingData && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <span>{t.returnWorkspaceBtn}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        {/* Page 2 Title & Executive Introduction */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/80 border border-blue-800/80 rounded-md text-xs font-medium text-blue-300">
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <span>{t.tagline}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white text-balance">
            {t.pageTitle}
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl leading-relaxed">
            {t.pageSubtitle}
          </p>

          {/* Creator & Core Governance Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3.5 py-2">
              <User className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Created By</span>
                <span className="font-semibold text-white">Cesar Herrera</span>
                <span className="text-slate-400 text-[11px] block">{t.creatorRole}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3.5 py-2">
              <Briefcase className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">{t.coreGovTitle}</span>
                <span className="font-semibold text-white">PMI PMBOK® Standard</span>
                <span className="text-slate-400 text-[11px] block">{t.coreGovDesc}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/80 rounded-lg px-3.5 py-2">
              <History className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Version Control</span>
                <span className="font-semibold text-white font-mono">{currentVersion}</span>
                <span className="text-slate-400 text-[11px] block">Snapshot & Baseline Auditing</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: DETAILED SYSTEM FEATURES & OPERATING INSTRUCTIONS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-2">
            <Layers className="w-5 h-5 text-blue-400" />
            <h2>{t.featuresHeader}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* Feature 1 */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-5 space-y-2.5 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <Workflow className="w-4 h-4 text-blue-400" />
                <span>{t.step1Title}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t.step1Desc}
              </p>
              <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">15k char guardrail</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">PII pre-flight</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">10s undo buffer</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-5 space-y-2.5 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <span>{t.step2Title}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t.step2Desc}
              </p>
              <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Mandatory owners</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Computed overdue</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Closed archive</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-5 space-y-2.5 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>{t.step3Title}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t.step3Desc}
              </p>
              <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Threats vs Realized Issues</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Treatment plans</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-5 space-y-2.5 hover:border-slate-600 transition-colors">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>{t.step4Title}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t.step4Desc}
              </p>
              <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Automatic RAG status</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Grounded narrative</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">JSON & Print</span>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-5 space-y-2.5 hover:border-slate-600 transition-colors md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 font-bold text-white text-sm">
                <History className="w-4 h-4 text-purple-400" />
                <span>{t.step5Title}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {t.step5Desc}
              </p>
              <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Active Baseline: {currentVersion}</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Minor & Major releases</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Chronological audit log</span>
                <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">1-click restore</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: PROMINENT GOVERNANCE FRAMEWORK DIRECTIVE NOTE & SELECTION */}
        <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-2 border-blue-500/70 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Special User-Requested Governance Note Card */}
          <div className="bg-blue-950/70 border border-blue-500/80 rounded-xl p-4 sm:p-5 space-y-2 text-white relative z-10">
            <div className="flex items-center gap-2 text-blue-300 font-mono text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>{t.govDirectiveBadge}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {t.govDirectiveTitle}
            </h3>
            <p className="text-sm text-blue-100 font-medium leading-relaxed bg-blue-900/40 border border-blue-400/40 rounded-lg p-3">
              "{t.govDirectiveNote}"
            </p>
          </div>

          {/* Interactive Framework Selector */}
          <div className="space-y-3 relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
              <div>
                <h4 className="text-base font-bold text-white">{t.selectFrameworkTitle}</h4>
                <p className="text-xs text-slate-400">{t.selectFrameworkDesc}</p>
              </div>
              <span className="text-xs font-mono bg-blue-600/20 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded">
                Active: {currentFramework === 'PMI' ? 'PMI PMBOK® Standard' : 'ISO 31000 Standard'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Option A: PMI Standard */}
              <div
                onClick={() => onSelectFramework('PMI')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  currentFramework === 'PMI'
                    ? 'border-blue-500 bg-blue-950/60 ring-2 ring-blue-500/60 shadow-lg'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold block">
                      PMBOK® Alignment
                    </span>
                    <h5 className="text-base font-bold text-white mt-1">{t.pmiTitle}</h5>
                    <p className="text-[11px] text-slate-400">{t.pmiSub}</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      currentFramework === 'PMI'
                        ? 'border-blue-400 bg-blue-500 text-white'
                        : 'border-slate-700'
                    }`}
                  >
                    {currentFramework === 'PMI' && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] space-y-1.5 text-slate-300">
                  {t.pmiBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Option B: ISO 31000 Standard */}
              <div
                onClick={() => onSelectFramework('ISO31000')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  currentFramework === 'ISO31000'
                    ? 'border-blue-500 bg-blue-950/60 ring-2 ring-blue-500/60 shadow-lg'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      International Standard
                    </span>
                    <h5 className="text-base font-bold text-white mt-1">{t.isoTitle}</h5>
                    <p className="text-[11px] text-slate-400">{t.isoSub}</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${
                      currentFramework === 'ISO31000'
                        ? 'border-blue-400 bg-blue-500 text-white'
                        : 'border-slate-700'
                    }`}
                  >
                    {currentFramework === 'ISO31000' && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] space-y-1.5 text-slate-300">
                  {t.isoBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: CHOOSE SIMULATION OR BLANK WORKSPACE */}
        <section className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white">{t.selectScenarioTitle}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{t.selectScenarioDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Simulation 1: Aecon */}
            <div
              onClick={() => setSelectedScenario('aecon')}
              className={`p-4.5 rounded-xl border cursor-pointer transition-all ${
                selectedScenario === 'aecon'
                  ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/50 shadow-md'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Defense / Civil IPD</span>
                {selectedScenario === 'aecon' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <h4 className="font-bold text-sm text-white mt-1.5">{t.aeconTitle}</h4>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                {t.aeconDesc}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
                <div>· Site trailer IT Toughbooks</div>
                <div>· Restricted area ACSO visitor logs</div>
                <div>· Sector A subgrade compaction contradiction</div>
              </div>
            </div>

            {/* Simulation 2: Rio Tinto */}
            <div
              onClick={() => setSelectedScenario('rioTinto')}
              className={`p-4.5 rounded-xl border cursor-pointer transition-all ${
                selectedScenario === 'rioTinto'
                  ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/50 shadow-md'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-semibold">Mining & Processing</span>
                {selectedScenario === 'rioTinto' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <h4 className="font-bold text-sm text-white mt-1.5">{t.rioTintoTitle}</h4>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                {t.rioTintoDesc}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
                <div>· Camp 1500 DLE ruggedized tablets</div>
                <div>· UK membrane filter customs stoppage</div>
                <div>· High-altitude master schedule conflict</div>
              </div>
            </div>

            {/* Simulation 3: Clean Workspace */}
            <div
              onClick={() => setSelectedScenario('clean')}
              className={`p-4.5 rounded-xl border cursor-pointer transition-all ${
                selectedScenario === 'clean'
                  ? 'border-blue-500 bg-blue-950/40 ring-1 ring-blue-500/50 shadow-md'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Custom Project</span>
                {selectedScenario === 'clean' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <h4 className="font-bold text-sm text-white mt-1.5">{t.cleanTitle}</h4>
              <p className="text-[11px] text-slate-300 mt-1">
                {t.cleanDesc}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
                <div>· Ready for custom project title</div>
                <div>· Clean Action & Risk Registers</div>
                <div>· Flexible reference date setting</div>
              </div>
            </div>
          </div>

          {/* Week Selector for Preloaded Simulations */}
          {selectedScenario !== 'clean' && (
            <div className="flex items-center gap-3 pt-2 text-xs">
              <span className="text-slate-400 font-mono">{t.phaseLabel}</span>
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedWeek('week1')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    selectedWeek === 'week1'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.week1Label}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWeek('week2')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    selectedWeek === 'week2'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.week2Label}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* BOTTOM ACTION BAR: Back to Page 1 & Enter Workspace */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            <span>Framework: <strong className="text-white">{currentFramework === 'PMI' ? 'PMI PMBOK®' : 'ISO 31000'}</strong></span>
            <span className="mx-2">·</span>
            <span>Scenario: <strong className="text-white">{selectedScenario === 'aecon' ? 'Aecon IPD' : selectedScenario === 'rioTinto' ? 'Rio Tinto Lithium' : 'Blank'}</strong></span>
            <span className="mx-2">·</span>
            <span className="text-slate-400">All other controls follow the PMI Standard.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onBackToWelcome}
              className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t.backToWelcomeBtn}</span>
            </button>

            {onClose && hasExistingData && (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.returnWorkspaceBtn}: {activeProjectName || 'Current'}</span>
              </button>
            )}

            <button
              onClick={handleLaunch}
              className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t.enterWorkspaceBtn}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-5 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-2">
          <span>ProjectPilot AI · Industrial Engineering Governance System</span>
          <span className="font-mono text-[11px] text-slate-400">
            Creator: Cesar Herrera · Version {currentVersion} · PMI Standard & {currentFramework === 'PMI' ? 'PMI PMBOK®' : 'ISO 31000'}
          </span>
        </div>
      </footer>
    </div>
  );
};
