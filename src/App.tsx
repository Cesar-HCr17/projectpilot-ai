// Copyright (c) 2026 Cesar Herrera.
// All rights reserved.
// This code is provided for portfolio demonstration purposes.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  HelpCircle,
  Info,
  X,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Mail,
  User,
  CheckCircle2,
  CheckCircle,
  FileText,
  Lock,
  Workflow,
  History,
  Camera,
  RotateCcw,
  Clock,
  Layers,
  AlertTriangle,
  Trash2,
  Rocket,
  Globe,
} from 'lucide-react';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TabIntake } from './components/TabIntake';
import { TabActions } from './components/TabActions';
import { TabRisks } from './components/TabRisks';
import { TabReport } from './components/TabReport';
import {
  ProjectState,
  ActionItem,
  RiskItem,
  DecisionItem,
  RAGAssessment,
  RiskFramework,
  ProjectSnapshot,
  Language,
  StagingSnapshot,
} from './types';
import { aeconScenario, rioTintoScenario } from './mockData';
import { calculateRAGStatus } from './utils/projectUtils';

const STORAGE_KEY = 'project_pilot_v1';
const SNAPSHOTS_STORAGE_KEY = 'project_pilot_snapshots_v1';
const CURRENT_VERSION_STORAGE_KEY = 'project_pilot_current_version_v1';
const LANGUAGE_STORAGE_KEY = 'project_pilot_language_v1';
const HAS_STARTED_STORAGE_KEY = 'project_pilot_has_started_v1';

export const uiDict = {
  en: {
    appTitle: 'ProjectPilot AI',
    appSubtitle: 'Intelligent Project Controls & Governance',
    intakeTab: '1. Intake Gate',
    actionsTab: '2. Action Tracker',
    risksTab: '3. Risk & Issues',
    reportTab: '4. Status Report',
    saveSnapshot: 'Save Snapshot',
    history: 'History',
    setup: 'Setup',
    undo: 'Undo',
    committedSuccess: 'Items successfully committed to Project Registers.',
    commitReverted: 'Commit reverted. Staging Gate reopened with selected items.',
    landingDesc: 'Enterprise Staging Gate & Industrial Engineering Governance Engine. Transform raw minutes into auditable project registers with zero hallucination.',
    continueEn: 'Continue in English',
    continueEs: 'Continuar en Español',
    continueFr: 'Continuer en Français',
    pmiDefault: 'Default · PMI Standard',
    pmiEs: 'Español · Norma PMI',
    pmiFr: 'Français · Norme PMI',
    step1Tag: 'Step 1 of 3 · Welcome & Language Selection',
    subTitle: 'Intelligent Project Controls & Governance Staging Gate',
    subDesc: 'Transform raw unstructured meeting minutes, site walkthrough logs, and field notes into auditable project registers with zero hallucination. Validates missing owners, ambiguous deadlines, and risks under PMI & ISO 31000 standards.',
    selectLangPrompt: 'Select your language to continue to Features & Instructions:',
    createdByLabel: 'Created by Cesar Herrera',
    creatorRole: 'Industrial Engineer & Risk Management Professional',
    versionPill: (v: string) => `Version ${v} · Industrial Engineering Project Controls`,
    helpModal: {
      title: 'Help & Governance Guide',
      subtitle: 'How ProjectPilot AI operates',
      sec1Title: 'How it Works',
      sec1Desc: 'ProjectPilot AI acts as an intelligent staging gate between unstructured meeting notes and formal project trackers. It uses LLM extraction to identify actions, blockers, and decisions, while explicitly flagging missing information (like unassigned owners or vague dates).',
      sec2Title: 'How to Use',
      sec2Steps: [
        '1. Paste meeting notes into the Intake tab.',
        '2. Click Analyze to process the text.',
        '3. Review the proposed extractions in the Staging Gate.',
        "4. Check the approved items and click 'Commit' to push them to the live registers.",
      ],
      sec3Title: 'Data Security & Privacy',
      sec3Desc: "100% Client-Side Storage. This application does not use a backend database. All project data, including your trackers and registers, is saved strictly locally in your browser's localStorage. No project data is retained, tracked, or visible to the creator. The only external connection is a stateless API call to extract the text.",
      closeBtn: 'Got it',
    },
    infoModal: {
      title: 'App Info & Support',
      subtitle: 'Project details and creator contact',
      appLabel: 'Application',
      appName: 'ProjectPilot AI (Portfolio Prototype)',
      versionLabel: 'Version',
      createdLabel: 'Created By',
      creatorName: 'Cesar Herrera',
      creatorRole: 'Industrial Engineer & Risk Management Professional',
      contactTitle: 'Contact / Support',
      contactDesc: 'Have questions, feedback, or need support with ProjectPilot AI?',
      contactBtn: 'Contact Support: caherrera710@gmail.com',
      licenseTitle: 'License & Copyright',
      licenseDesc: 'Copyright © 2026 Cesar Herrera. All rights reserved. This prototype is proprietary portfolio material. Unauthorized commercial use, reproduction, or distribution of this source code and operational framework is prohibited.',
      closeBtn: 'Close',
    },
    saveModal: {
      title: 'Save Project Snapshot',
      subtitle: 'Capture an audit baseline of current registers',
      targetVer: 'New Version Target:',
      noteLabel: 'Change Note / Baseline Description',
      notePlaceholder: 'e.g., Baseline after Week 1 meeting',
      noteHint: 'Describe what milestone, review, or intake triggered this snapshot.',
      majorLabel: 'Major Release',
      majorDesc: (nextMaj: string, nextMin: string) => `Check to bump the major version (e.g., to ${nextMaj}) instead of minor increment (${nextMin}).`,
      currentRegs: 'Current Live Registers:',
      cancel: 'Cancel',
      confirm: 'Confirm & Save Snapshot',
    },
    historyModal: {
      title: 'Project Version History & Baselines',
      subtitle: (v: string) => `Chronological audit log of saved baselines. Current active: ${v}`,
      noSnapshots: 'No snapshots recorded yet.',
      noSnapshotsDesc: 'Click "Save Snapshot" in the header to establish your first baseline (e.g., after intake analysis or review).',
      createFirst: 'Create First Snapshot',
      activeBadge: 'Current Active',
      restoreBtn: 'Restore',
      restoreTitle: (v: string) => `Restore project data to baseline ${v}`,
      deleteTitle: 'Delete this snapshot from history',
      totalBaselines: (n: number) => `Total Saved Baselines: ${n}`,
      closeBtn: 'Close',
    },
    purgeModal: {
      title: 'Security Data Purge & Reset',
      subtitle: 'Permanent double-authenticated wipe of custom data & uploads',
      warning: 'Enterprise Security Protocol: This action permanently wipes all user-created actions, risks, decisions, custom snapshots, uploaded notes, and browser storage. Factory demonstration files (Aecon & Rio Tinto) will remain safely intact.',
      factor1Title: 'Factor 1: Enter Security Verification Code',
      factor1Desc: 'To prove human administrative authorization, type the exact code displayed below:',
      factor1Placeholder: 'Enter verification code...',
      factor2Title: 'Factor 2: Mandatory Compliance Confirmation',
      factor2Checkbox: 'I confirm that I understand this will permanently delete all user-created actions, risks, decisions, uploaded notes, custom baselines, and browser local storage. Only built-in demo scenarios will remain.',
      cancel: 'Cancel',
      confirmPurge: 'Authorize & Execute Double-Authenticated Purge',
    },
    footer: {
      brand: 'ProjectPilot AI · Industrial Engineering Governance System',
      meta: (v: string, rf: string) => `Creator: Cesar Herrera · Version ${v} · PMI Standard (Core Governance) & ${rf} (Risks)`,
      copyright: 'All rights reserved. For demonstration and portfolio purposes only.',
    },
  },
  es: {
    appTitle: 'ProjectPilot AI',
    appSubtitle: 'Control Inteligente de Proyectos y Gobernanza',
    intakeTab: '1. Recepción y Validación',
    actionsTab: '2. Seguimiento de Acciones',
    risksTab: '3. Riesgos y Problemas',
    reportTab: '4. Informe de Estado',
    saveSnapshot: 'Guardar Versión',
    history: 'Historial',
    setup: 'Configuración',
    undo: 'Deshacer',
    committedSuccess: 'Elementos confirmados con éxito en los Registros del Proyecto.',
    commitReverted: 'Cambios deshechos. Compuerta de revisión reabierta con los elementos seleccionados.',
    landingDesc: 'Compuerta de Revisión Empresarial y Motor de Gobernanza en Ingeniería Industrial. Transforme minutas desordenadas en registros auditables con cero alucinaciones.',
    continueEn: 'Continuar en Inglés',
    continueEs: 'Continuar en Español',
    continueFr: 'Continuer en Français',
    pmiDefault: 'Predeterminado · Norma PMI',
    pmiEs: 'Español · Norma PMI',
    pmiFr: 'Français · Norme PMI',
    step1Tag: 'Paso 1 de 3 · Bienvenida y Selección de Idioma',
    subTitle: 'Compuerta Inteligente de Control de Proyectos y Gobernanza',
    subDesc: 'Transforme minutas sin procesar, registros de campo y notas en registros de proyecto auditables con cero alucinaciones. Valida responsables faltantes, fechas ambiguas y riesgos bajo normas PMI e ISO 31000.',
    selectLangPrompt: 'Seleccione su idioma para continuar a Características e Instrucciones:',
    createdByLabel: 'Creado por Cesar Herrera',
    creatorRole: 'Ingeniero Industrial & Especialista en Gestión del Riesgo',
    versionPill: (v: string) => `Versión ${v} · Control de Proyectos de Ingeniería Industrial`,
    helpModal: {
      title: 'Ayuda y Guía de Gobernanza',
      subtitle: 'Cómo funciona ProjectPilot AI',
      sec1Title: 'Cómo Funciona',
      sec1Desc: 'ProjectPilot AI actúa como una compuerta inteligente entre notas de reunión sin formato y registros formales de proyecto. Emplea extracción con LLM para identificar acciones, bloqueos y decisiones, alertando explícitamente sobre vacíos de información (como responsables no asignados o fechas ambiguas).',
      sec2Title: 'Modo de Uso',
      sec2Steps: [
        '1. Pegue las notas de reunión en la pestaña de Recepción y Validación.',
        '2. Haga clic en Analizar y Extraer para procesar el texto.',
        '3. Revise las extracciones propuestas en la Compuerta de Validación.',
        "4. Marque los elementos aprobados y haga clic en 'Confirmar' para enviarlos a los registros vivos.",
      ],
      sec3Title: 'Seguridad de Datos y Privacidad',
      sec3Desc: 'Almacenamiento 100% en el Cliente. Esta aplicación no utiliza base de datos externa. Toda la información del proyecto, incluidos sus registros y tablas, se guarda estrictamente de forma local en el localStorage de su navegador. El creador no recopila ni tiene acceso a ningún dato.',
      closeBtn: 'Entendido',
    },
    infoModal: {
      title: 'Información y Soporte de la Aplicación',
      subtitle: 'Detalles del proyecto y contacto del creador',
      appLabel: 'Aplicación',
      appName: 'ProjectPilot AI (Prototipo de Portafolio)',
      versionLabel: 'Versión',
      createdLabel: 'Creado por',
      creatorName: 'Cesar Herrera',
      creatorRole: 'Ingeniero Industrial & Especialista en Gestión del Riesgo',
      contactTitle: 'Contacto y Soporte',
      contactDesc: '¿Tiene preguntas, comentarios o necesita soporte con ProjectPilot AI?',
      contactBtn: 'Contactar a Soporte: caherrera710@gmail.com',
      licenseTitle: 'Licencia y Derechos de Autor',
      licenseDesc: 'Copyright © 2026 Cesar Herrera. Todos los derechos reservados. Este prototipo es material de portafolio propietario. Se prohíbe el uso comercial, reproducción o distribución no autorizada de este código fuente y marco operativo.',
      closeBtn: 'Cerrar',
    },
    saveModal: {
      title: 'Guardar Línea Base de Versión',
      subtitle: 'Capture una instantánea de auditoría de los registros actuales',
      targetVer: 'Nueva Versión Objetivo:',
      noteLabel: 'Nota de Cambio / Descripción de la Línea Base',
      notePlaceholder: 'ej. Línea base tras reunión Semana 1',
      noteHint: 'Describa qué hito, revisión o minuta motivó esta captura.',
      majorLabel: 'Versión Mayor (Major Release)',
      majorDesc: (nextMaj: string, nextMin: string) => `Marque para incrementar la versión principal (ej. a ${nextMaj}) en lugar de incremento menor (${nextMin}).`,
      currentRegs: 'Registros Activos en Vivo:',
      cancel: 'Cancelar',
      confirm: 'Confirmar y Guardar Versión',
    },
    historyModal: {
      title: 'Historial de Versiones y Líneas Base',
      subtitle: (v: string) => `Registro cronológico de auditoría de líneas base. Versión activa actual: ${v}`,
      noSnapshots: 'Aún no hay versiones registradas.',
      noSnapshotsDesc: 'Haga clic en "Guardar Versión" en el encabezado para establecer la primera línea base (ej. tras análisis de minutas o revisión).',
      createFirst: 'Crear Primera Versión',
      activeBadge: 'Activa Actual',
      restoreBtn: 'Restaurar',
      restoreTitle: (v: string) => `Restaurar datos del proyecto a la línea base ${v}`,
      deleteTitle: 'Eliminar esta versión del historial',
      totalBaselines: (n: number) => `Total de Líneas Base Guardadas: ${n}`,
      closeBtn: 'Cerrar',
    },
    purgeModal: {
      title: 'Purga de Seguridad y Sanitización',
      subtitle: 'Eliminación permanente con doble autenticación de datos creados y archivos',
      warning: 'Protocolo de Seguridad Empresarial: Esta acción elimina permanentemente todas las acciones, riesgos, decisiones, versiones y notas creadas o cargadas por el usuario en el almacenamiento local. Los escenarios de demostración de fábrica (Aecon y Rio Tinto) permanecerán totalmente intactos.',
      factor1Title: 'Factor 1: Ingrese el Código de Verificación de Seguridad',
      factor1Desc: 'Para comprobar autorización administrativa humana, escriba exactamente el código mostrado a continuación:',
      factor1Placeholder: 'Ingrese el código de verificación...',
      factor2Title: 'Factor 2: Confirmación Obligatoria de Cumplimiento',
      factor2Checkbox: 'Confirmo que entiendo y autorizo la eliminación permanente de todas las acciones, riesgos, decisiones, versiones y notas cargadas. Solo permanecerán los datos de demostración del sistema.',
      cancel: 'Cancelar',
      confirmPurge: 'Autorizar y Ejecutar Purga con Doble Autenticación',
    },
    footer: {
      brand: 'ProjectPilot AI · Sistema de Gobernanza en Ingeniería Industrial',
      meta: (v: string, rf: string) => `Creador: Cesar Herrera · Versión ${v} · Norma PMI (Gobernanza Principal) y ${rf} (Riesgos)`,
      copyright: 'Todos los derechos reservados. Solo para propósitos de demostración y portafolio.',
    },
  },
  fr: {
    appTitle: 'ProjectPilot AI',
    appSubtitle: 'Contrôles et Gouvernance Intelligents de Projets',
    intakeTab: '1. Réception et Validation',
    actionsTab: '2. Suivi des Actions',
    risksTab: '3. Risques et Problèmes',
    reportTab: '4. Rapport d\'État',
    saveSnapshot: 'Enregistrer Version',
    history: 'Historique',
    setup: 'Configuration',
    undo: 'Annuler',
    committedSuccess: 'Éléments validés avec succès dans les Registres du Projet.',
    commitReverted: 'Modifications annulées. Porte de validation rouverte avec les éléments sélectionnés.',
    landingDesc: 'Porte de Validation d\'Entreprise et Moteur de Gouvernance en Ingénierie Industrielle. Transformez des comptes-rendus bruts en registres auditables sans hallucination.',
    continueEn: 'Continuer en Anglais',
    continueEs: 'Continuar en Español',
    continueFr: 'Continuer en Français',
    pmiDefault: 'Par défaut · Norme PMI',
    pmiEs: 'Espagnol · Norme PMI',
    pmiFr: 'Français · Norme PMI',
    step1Tag: 'Étape 1 sur 3 · Bienvenue et Choix de la Langue',
    subTitle: 'Porte Intelligente de Contrôle de Projets et Gouvernance',
    subDesc: 'Transformez des comptes-rendus bruts, journaux de chantier et notes de terrain en registres de projet auditables sans hallucination. Vérifie les responsables manquants, échéances ambiguës et risques selon les normes PMI et ISO 31000.',
    selectLangPrompt: 'Sélectionnez votre langue pour passer aux Fonctionnalités et Instructions :',
    createdByLabel: 'Créé par Cesar Herrera',
    creatorRole: 'Ingénieur Industriel & Spécialiste en Gestion des Risques',
    versionPill: (v: string) => `Version ${v} · Contrôles de Projet en Ingénierie Industrielle`,
    helpModal: {
      title: 'Aide et Guide de Gouvernance',
      subtitle: 'Fonctionnement de ProjectPilot AI',
      sec1Title: 'Comment Ça Marche',
      sec1Desc: 'ProjectPilot AI agit comme une porte intelligente entre les notes de réunion non structurées et les registres formels de projet. Il utilise un LLM pour extraire actions, blocages et décisions tout en signalant explicitement les informations manquantes.',
      sec2Title: 'Mode d\'Emploi',
      sec2Steps: [
        '1. Collez les comptes-rendus dans l\'onglet Réception et Validation.',
        '2. Cliquez sur Analyser et Extraire pour traiter le texte.',
        '3. Vérifiez les extractions proposées dans la Porte de Validation.',
        "4. Cochez les éléments approuvés et cliquez sur 'Valider' pour les enregistrer.",
      ],
      sec3Title: 'Sécurité des Données et Confidentialité',
      sec3Desc: 'Stockage 100% Client. Cette application n\'utilise aucune base de données serveur. Toutes les données du projet sont enregistrées strictement en local dans le localStorage de votre navigateur.',
      closeBtn: 'Compris',
    },
    infoModal: {
      title: 'Informations et Support de l\'Application',
      subtitle: 'Détails du projet et contact du créateur',
      appLabel: 'Application',
      appName: 'ProjectPilot AI (Prototype Portfolio)',
      versionLabel: 'Version',
      createdLabel: 'Créé par',
      creatorName: 'Cesar Herrera',
      creatorRole: 'Ingénieur Industriel & Spécialiste en Gestion des Risques',
      contactTitle: 'Contact et Support',
      contactDesc: 'Vous avez des questions ou besoin d\'assistance pour ProjectPilot AI ?',
      contactBtn: 'Contacter le Support: caherrera710@gmail.com',
      licenseTitle: 'Licence et Droits d\'Auteur',
      licenseDesc: 'Copyright © 2026 Cesar Herrera. Tous droits réservés. Ce prototype constitue un matériel de portfolio propriétaire. Toute utilisation commerciale, reproduction ou distribution non autorisée de ce code source est strictement interdite.',
      closeBtn: 'Fermer',
    },
    saveModal: {
      title: 'Enregistrer une Version de Référence',
      subtitle: 'Capturer un instantané d\'audit des registres actuels',
      targetVer: 'Nouvelle Version Cible :',
      noteLabel: 'Note de Modification / Description de la Référence',
      notePlaceholder: 'ex. Référence après réunion Semaine 1',
      noteHint: 'Décrivez le jalon ou la revue ayant motivé cet enregistrement.',
      majorLabel: 'Version Majeure (Major Release)',
      majorDesc: (nextMaj: string, nextMin: string) => `Cochez pour incrémenter la version majeure (ex. vers ${nextMaj}) au lieu d'une incrémentation mineure (${nextMin}).`,
      currentRegs: 'Registres Actuels en Direct :',
      cancel: 'Annuler',
      confirm: 'Confirmer et Enregistrer la Version',
    },
    historyModal: {
      title: 'Historique des Versions et Références',
      subtitle: (v: string) => `Journal chronologique d'audit des versions. Version active actuelle : ${v}`,
      noSnapshots: 'Aucune référence enregistrée pour l\'instant.',
      noSnapshotsDesc: 'Cliquez sur "Enregistrer Version" dans l\'en-tête pour créer votre première ligne de base.',
      createFirst: 'Créer Première Version',
      activeBadge: 'Actuelle',
      restoreBtn: 'Restaurer',
      restoreTitle: (v: string) => `Restaurer les données du projet à la référence ${v}`,
      deleteTitle: 'Supprimer cette référence de l\'historique',
      totalBaselines: (n: number) => `Total des Références Enregistrées : ${n}`,
      closeBtn: 'Fermer',
    },
    purgeModal: {
      title: 'Purge de Sécurité et Réinitialisation',
      subtitle: 'Suppression définitive à double authentification des données créées et téléversées',
      warning: 'Protocole de Sécurité Entreprise : Cette opération supprime définitivement toutes les actions, risques, décisions, versions et notes téléversées par l\'utilisateur. Les scénarios de démonstration intégrés (Aecon et Rio Tinto) restent parfaitement intacts.',
      factor1Title: 'Facteur 1 : Saisissez le Code de Vérification de Sécurité',
      factor1Desc: 'Pour prouver l\'autorisation administrative humaine, saisissez exactement le code affiché ci-dessous :',
      factor1Placeholder: 'Entrez le code de vérification...',
      factor2Title: 'Facteur 2 : Confirmation Obligatoire de Conformité',
      factor2Checkbox: 'Je confirme comprendre et autoriser la suppression définitive de toutes les données créées, registres et sauvegardes. Seules les données de démonstration du système seront conservées.',
      cancel: 'Annuler',
      confirmPurge: 'Autoriser et Exécuter la Purge à Double Authentification',
    },
    footer: {
      brand: 'ProjectPilot AI · Système de Gouvernance en Ingénierie Industrielle',
      meta: (v: string, rf: string) => `Créateur : Cesar Herrera · Version ${v} · Norme PMI (Gouvernance Principale) et ${rf} (Risques)`,
      copyright: 'Tous droits réservés. À des fins de démonstration et de portfolio uniquement.',
    },
  },
};

interface StateBuffer {
  actions: ActionItem[];
  risks: RiskItem[];
  decisions: DecisionItem[];
  stagingSnapshot?: StagingSnapshot;
}

export default function App() {
  // Multilingual & Landing State
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (saved && (saved === 'en' || saved === 'es' || saved === 'fr')) return saved;
    } catch (e) {}
    return 'en';
  });

  const [hasStarted, setHasStarted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(HAS_STARTED_STORAGE_KEY) === 'true';
    } catch (e) {}
    return false;
  });

  // Screen flow: 'welcome' (Page 1) -> 'features' (Page 2) -> 'workspace' (Page 3)
  const [appScreen, setAppScreen] = useState<'welcome' | 'features' | 'workspace'>(() => {
    try {
      const started = localStorage.getItem(HAS_STARTED_STORAGE_KEY) === 'true';
      if (started) return 'workspace';
    } catch (e) {}
    return 'welcome';
  });

  const [activeTab, setActiveTab] = useState<'intake' | 'actions' | 'risks' | 'report'>('intake');
  const [activeNotesInput, setActiveNotesInput] = useState<string>(aeconScenario.week1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [appError, setAppError] = useState<string | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Guardrail 3: Undo / Revert Commit State Buffer
  const [previousStateBuffer, setPreviousStateBuffer] = useState<StateBuffer | null>(null);
  const [isUndoToastVisible, setIsUndoToastVisible] = useState(false);
  const [restoredStaging, setRestoredStaging] = useState<StagingSnapshot | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Version Control & Snapshot State (Adjusted to v2.7 Baseline)
  const [versionHistory, setVersionHistory] = useState<ProjectSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem(SNAPSHOTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load version history from localStorage:', e);
    }
    return [];
  });

  const [currentVersion, setCurrentVersion] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_VERSION_STORAGE_KEY);
      if (saved && saved !== 'v1.0') return saved;
    } catch (e) {}
    return 'v2.7';
  });

  const [isSaveSnapshotModalOpen, setIsSaveSnapshotModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [snapshotChangeNote, setSnapshotChangeNote] = useState('');
  const [isMajorRelease, setIsMajorRelease] = useState(false);

  // Security Feature: Double-Authenticated Data Purge Modal State
  const [isSecurityPurgeOpen, setIsSecurityPurgeOpen] = useState(false);
  const [purgeSecurityCode, setPurgeSecurityCode] = useState('');
  const [enteredPurgeCode, setEnteredPurgeCode] = useState('');
  const [purgeConfirmedCheckbox, setPurgeConfirmedCheckbox] = useState(false);

  // Initialize Project State from localStorage or defaults
  const [state, setState] = useState<ProjectState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ProjectState;
        return {
          ...parsed,
          riskFramework: parsed.riskFramework || 'PMI',
        };
      }
    } catch (e) {
      console.warn('Failed to load project state from localStorage:', e);
    }

    const defaultActions: ActionItem[] = [];
    const defaultRisks: RiskItem[] = [];
    const defaultDecisions: DecisionItem[] = [];
    const refDate = '2026-10-13';
    const rag = calculateRAGStatus(defaultActions, defaultRisks, refDate);

    return {
      projectName: aeconScenario.title,
      projectDescription: aeconScenario.description,
      referenceDate: refDate,
      riskFramework: 'PMI',
      actions: defaultActions,
      risks: defaultRisks,
      decisions: defaultDecisions,
      ragAssessment: {
        status: rag.calculatedStatus,
        calculatedStatus: rag.calculatedStatus,
        reason: rag.reason,
        triggeredRules: rag.triggeredRules,
        isManualOverride: false,
      },
      executiveSummary: null,
      lastAnalysisTimestamp: null,
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save project state to localStorage:', e);
    }
  }, [state]);

  // Save version history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SNAPSHOTS_STORAGE_KEY, JSON.stringify(versionHistory));
    } catch (e) {
      console.error('Failed to save version history to localStorage:', e);
    }
  }, [versionHistory]);

  // Save current version to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_VERSION_STORAGE_KEY, currentVersion);
    } catch (e) {
      console.error('Failed to save current version to localStorage:', e);
    }
  }, [currentVersion]);

  // Save language to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (e) {
      console.error('Failed to save language to localStorage:', e);
    }
  }, [language]);

  // Save hasStarted to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HAS_STARTED_STORAGE_KEY, String(hasStarted));
    } catch (e) {
      console.error('Failed to save hasStarted to localStorage:', e);
    }
  }, [hasStarted]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Helper to re-evaluate RAG status if not manually overridden
  const recalculateRAG = useCallback(
    (actions: ActionItem[], risks: RiskItem[], refDate: string, currentRag: RAGAssessment): RAGAssessment => {
      const { calculatedStatus, triggeredRules, reason } = calculateRAGStatus(actions, risks, refDate);
      if (currentRag.isManualOverride) {
        return {
          ...currentRag,
          calculatedStatus,
          triggeredRules,
        };
      }
      return {
        status: calculatedStatus,
        calculatedStatus,
        triggeredRules,
        reason,
        isManualOverride: false,
      };
    },
    []
  );

  // Metadata Updates (Name, Description, Ref Date)
  const handleUpdateProjectMeta = (name: string, description: string, referenceDate: string) => {
    setState((prev) => {
      const newRag = recalculateRAG(prev.actions, prev.risks, referenceDate, prev.ragAssessment);
      return {
        ...prev,
        projectName: name,
        projectDescription: description,
        referenceDate,
        ragAssessment: newRag,
      };
    });
    showToast('Project metadata and reference date updated.');
  };

  // Load Aecon Scenario (Week 1 or Week 2)
  const handleLoadAecon = (week: 'week1' | 'week2') => {
    const isWeek1 = week === 'week1';
    const refDate = isWeek1 ? '2026-10-13' : '2026-10-20';
    setActiveNotesInput(isWeek1 ? aeconScenario.week1 : aeconScenario.week2);
    setActiveTab('intake');
    setState((prev) => {
      const newRag = recalculateRAG(prev.actions, prev.risks, refDate, prev.ragAssessment);
      return {
        ...prev,
        projectName: aeconScenario.title,
        projectDescription: aeconScenario.description,
        referenceDate: refDate,
        ragAssessment: newRag,
      };
    });
    showToast(
      isWeek1
        ? 'Loaded Aecon AOTH Radar Program (Week 1 Kickoff). Click "Analyze & Extract Records".'
        : 'Loaded Aecon AOTH Radar Program (Week 2 Updates & Diffs). Click "Analyze & Extract Records".'
    );
  };

  // Load Rio Tinto Scenario (Week 1 or Week 2)
  const handleLoadRioTinto = (week: 'week1' | 'week2') => {
    const isWeek1 = week === 'week1';
    const refDate = isWeek1 ? '2026-10-13' : '2026-10-20';
    setActiveNotesInput(isWeek1 ? rioTintoScenario.week1 : rioTintoScenario.week2);
    setActiveTab('intake');
    setState((prev) => {
      const newRag = recalculateRAG(prev.actions, prev.risks, refDate, prev.ragAssessment);
      return {
        ...prev,
        projectName: rioTintoScenario.title,
        projectDescription: rioTintoScenario.description,
        referenceDate: refDate,
        ragAssessment: newRag,
      };
    });
    showToast(
      isWeek1
        ? 'Loaded Rio Tinto Rincón Lithium Project (Week 1 Kickoff). Click "Analyze & Extract Records".'
        : 'Loaded Rio Tinto Rincón Lithium Project (Week 2 Updates & Diffs). Click "Analyze & Extract Records".'
    );
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${state.projectName.replace(/\s+/g, '_')}_state.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Project JSON exported successfully.');
  };

  // Import JSON
  const handleImportJSON = (imported: ProjectState) => {
    setState(imported);
    showToast('Project data imported successfully.');
  };

  // Framework Switcher
  const handleSelectFramework = (framework: RiskFramework) => {
    setState((prev) => ({
      ...prev,
      riskFramework: framework,
    }));
    showToast(`Risk Framework switched to ${framework === 'PMI' ? 'PMI PMBOK®' : 'ISO 31000'}.`);
  };

  // Launch from First Interface / Welcome Screen
  const handleLaunchSimulation = (scenarioKey: 'aecon' | 'rioTinto' | 'clean', week: 'week1' | 'week2') => {
    if (scenarioKey === 'aecon') {
      handleLoadAecon(week);
    } else if (scenarioKey === 'rioTinto') {
      handleLoadRioTinto(week);
    } else {
      const refDate = '2026-10-13';
      const rag = calculateRAGStatus([], [], refDate);
      setState({
        projectName: 'Custom Engineering Project',
        projectDescription: 'Clean Register & Meeting Minutes Intake',
        referenceDate: refDate,
        riskFramework: state.riskFramework,
        actions: [],
        risks: [],
        decisions: [],
        ragAssessment: {
          status: rag.calculatedStatus,
          calculatedStatus: rag.calculatedStatus,
          reason: rag.reason,
          triggeredRules: rag.triggeredRules,
          isManualOverride: false,
        },
        executiveSummary: null,
        lastAnalysisTimestamp: null,
      });
      setActiveNotesInput('');
      setActiveTab('intake');
      showToast('Clean workspace initialized. Ready for meeting notes.');
    }
    setAppScreen('workspace');
    setHasStarted(true);
    try {
      localStorage.setItem(HAS_STARTED_STORAGE_KEY, 'true');
    } catch (e) {}
  };

  // Reset Workspace
  const handleResetWorkspace = () => {
    if (confirm('Are you sure you want to reset the workspace to initial default simulation?')) {
      const refDate = '2026-10-13';
      const rag = calculateRAGStatus([], [], refDate);
      const resetState: ProjectState = {
        projectName: aeconScenario.title,
        projectDescription: aeconScenario.description,
        referenceDate: refDate,
        riskFramework: state.riskFramework || 'PMI',
        actions: [],
        risks: [],
        decisions: [],
        ragAssessment: {
          status: rag.calculatedStatus,
          calculatedStatus: rag.calculatedStatus,
          reason: rag.reason,
          triggeredRules: rag.triggeredRules,
          isManualOverride: false,
        },
        executiveSummary: null,
        lastAnalysisTimestamp: null,
      };
      setState(resetState);
      setActiveNotesInput(aeconScenario.week1);
      setActiveTab('intake');
      localStorage.removeItem(STORAGE_KEY);
      showToast('Workspace reset to Aecon initial simulation.');
    }
  };

  // Version snapshot helpers and handlers
  const calculateNextVersion = (curr: string, isMajor: boolean): string => {
    const match = curr.match(/v?(\d+)\.(\d+)/i);
    if (!match) return isMajor ? 'v3.0' : 'v2.8';
    const majNum = parseInt(match[1], 10);
    const minNum = parseInt(match[2], 10);
    if (isMajor) {
      return `v${majNum + 1}.0`;
    }
    return `v${majNum}.${minNum + 1}`;
  };

  const handleOpenSaveSnapshot = () => {
    setSnapshotChangeNote('');
    setIsMajorRelease(false);
    setIsSaveSnapshotModalOpen(true);
  };

  const handleConfirmSaveSnapshot = () => {
    const nextVer = calculateNextVersion(currentVersion, isMajorRelease);
    const note = snapshotChangeNote.trim() || `Baseline snapshot ${new Date().toLocaleDateString()}`;
    const newSnapshot: ProjectSnapshot = {
      version: nextVer,
      timestamp: new Date().toISOString(),
      changeNote: note,
      data: {
        actions: JSON.parse(JSON.stringify(state.actions)),
        risks: JSON.parse(JSON.stringify(state.risks)),
        decisions: JSON.parse(JSON.stringify(state.decisions)),
      },
    };

    setVersionHistory((prev) => [newSnapshot, ...prev]);
    setCurrentVersion(nextVer);
    setIsSaveSnapshotModalOpen(false);
    setSnapshotChangeNote('');
    setIsMajorRelease(false);
    showToast(`Snapshot baseline ${nextVer} saved: "${note}"`);
  };

  const handleRestoreSnapshot = (snapshot: ProjectSnapshot) => {
    if (
      window.confirm(
        `This will overwrite current working data with snapshot baseline ${snapshot.version} ("${snapshot.changeNote}"). Do you want to proceed?`
      )
    ) {
      setState((prev) => {
        const restoredActions = JSON.parse(JSON.stringify(snapshot.data.actions));
        const restoredRisks = JSON.parse(JSON.stringify(snapshot.data.risks));
        const restoredDecisions = JSON.parse(JSON.stringify(snapshot.data.decisions));
        const newRag = recalculateRAG(restoredActions, restoredRisks, prev.referenceDate, prev.ragAssessment);
        return {
          ...prev,
          actions: restoredActions,
          risks: restoredRisks,
          decisions: restoredDecisions,
          ragAssessment: newRag,
        };
      });
      setCurrentVersion(snapshot.version);
      setIsHistoryModalOpen(false);
      showToast(`Restored baseline snapshot ${snapshot.version}: "${snapshot.changeNote}"`);
    }
  };

  const handleDeleteSnapshot = (versionToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete snapshot ${versionToDelete} from history?`)) {
      setVersionHistory((prev) => prev.filter((s) => s.version !== versionToDelete));
      showToast(`Snapshot ${versionToDelete} removed from history.`);
    }
  };

  // Enterprise Security Purge Handlers (Double Authentication)
  const handleOpenSecurityPurge = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setPurgeSecurityCode(randomCode);
    setEnteredPurgeCode('');
    setPurgeConfirmedCheckbox(false);
    setIsSecurityPurgeOpen(true);
  };

  const handleExecuteSecurityPurge = () => {
    if (enteredPurgeCode.trim() !== purgeSecurityCode || !purgeConfirmedCheckbox) {
      return;
    }
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SNAPSHOTS_STORAGE_KEY);
      localStorage.removeItem(CURRENT_VERSION_STORAGE_KEY);
    } catch (e) {
      console.warn('Storage purge warning', e);
    }

    // Reset state to factory demo baseline (Aecon IPD initial clean state)
    const refDate = '2026-10-13';
    const rag = calculateRAGStatus([], [], refDate);
    const factoryState: ProjectState = {
      projectName: aeconScenario.title,
      projectDescription: aeconScenario.description,
      referenceDate: refDate,
      riskFramework: 'PMI',
      actions: [],
      risks: [],
      decisions: [],
      ragAssessment: {
        status: rag.calculatedStatus,
        calculatedStatus: rag.calculatedStatus,
        reason: rag.reason,
        triggeredRules: rag.triggeredRules,
        isManualOverride: false,
      },
      executiveSummary: null,
      lastAnalysisTimestamp: null,
    };

    setState(factoryState);
    setActiveNotesInput(aeconScenario.week1);
    setVersionHistory([]);
    setCurrentVersion('v2.7');
    setRestoredStaging(null);
    setPreviousStateBuffer(null);
    setIsUndoToastVisible(false);
    setActiveTab('intake');
    setIsSecurityPurgeOpen(false);

    const purgeMsg =
      language === 'es'
        ? 'Purga de Seguridad Completada: Todos los registros del usuario y archivos han sido eliminados de forma segura. Se ha restaurado la línea base de demostración.'
        : language === 'fr'
        ? 'Purge de Sécurité Terminée : Toutes les données créées par l\'utilisateur ont été purgées avec succès. La ligne de base de démonstration a été restaurée.'
        : 'Security Purge Complete: All user-created data, uploads, and local history sanitized. Demo baseline restored.';
    showToast(purgeMsg);
  };

  // Commit Staging Gate Updates (Guardrail 3: Undo / Revert Commit)
  const handleCommitUpdates = (
    committed: {
      actionsToAdd: ActionItem[];
      actionUpdatesToApply: { id: string; updates: Partial<ActionItem> }[];
      risksToAdd: RiskItem[];
      riskUpdatesToApply: { id: string; updates: Partial<RiskItem> }[];
      decisionsToAdd: DecisionItem[];
    },
    stagingSnapshot?: StagingSnapshot
  ) => {
    // Store deep copy of previous state in previousStateBuffer
    setPreviousStateBuffer({
      actions: JSON.parse(JSON.stringify(state.actions)),
      risks: JSON.parse(JSON.stringify(state.risks)),
      decisions: JSON.parse(JSON.stringify(state.decisions)),
      stagingSnapshot: stagingSnapshot ? JSON.parse(JSON.stringify(stagingSnapshot)) : undefined,
    });
    setRestoredStaging(null);

    setState((prev) => {
      // 1. Update actions
      const updatedActions = prev.actions.map((act) => {
        const updateObj = committed.actionUpdatesToApply.find((u) => u.id === act.id);
        if (updateObj) {
          return { ...act, ...updateObj.updates };
        }
        return act;
      });
      const allActions = [...updatedActions, ...committed.actionsToAdd];

      // 2. Update risks
      const updatedRisks = prev.risks.map((risk) => {
        const updateObj = committed.riskUpdatesToApply.find((u) => u.id === risk.id);
        if (updateObj) {
          return { ...risk, ...updateObj.updates };
        }
        return risk;
      });
      const allRisks = [...updatedRisks, ...committed.risksToAdd];

      // 3. Add decisions
      const allDecisions = [...prev.decisions, ...committed.decisionsToAdd];

      // 4. Re-calculate RAG
      const newRag = recalculateRAG(allActions, allRisks, prev.referenceDate, prev.ragAssessment);

      return {
        ...prev,
        actions: allActions,
        risks: allRisks,
        decisions: allDecisions,
        ragAssessment: newRag,
        lastAnalysisTimestamp: new Date().toISOString(),
      };
    });

    // Display floating toast notification for 10 seconds with Undo button
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setIsUndoToastVisible(true);
    undoTimerRef.current = setTimeout(() => {
      setIsUndoToastVisible(false);
      setPreviousStateBuffer(null);
    }, 10000);
  };

  const handleUndoCommit = () => {
    if (!previousStateBuffer) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);

    // Restore state from previousStateBuffer
    setState((prev) => {
      const newRag = recalculateRAG(
        previousStateBuffer.actions,
        previousStateBuffer.risks,
        prev.referenceDate,
        prev.ragAssessment
      );
      return {
        ...prev,
        actions: previousStateBuffer.actions,
        risks: previousStateBuffer.risks,
        decisions: previousStateBuffer.decisions,
        ragAssessment: newRag,
      };
    });

    // Reopen Staging Gate with previously selected items still intact
    if (previousStateBuffer.stagingSnapshot) {
      setRestoredStaging(previousStateBuffer.stagingSnapshot);
    }
    setActiveTab('intake');

    // Clear buffer
    setPreviousStateBuffer(null);
    setIsUndoToastVisible(false);

    showToast(uiDict[language].commitReverted);
  };

  // Action Tracker handlers
  const handleUpdateAction = (id: string, updates: Partial<ActionItem>) => {
    setState((prev) => {
      const nextActions = prev.actions.map((a) => (a.id === id ? { ...a, ...updates } : a));
      const nextRag = recalculateRAG(nextActions, prev.risks, prev.referenceDate, prev.ragAssessment);
      return {
        ...prev,
        actions: nextActions,
        ragAssessment: nextRag,
      };
    });
  };

  const handleAddAction = (action: ActionItem) => {
    setState((prev) => {
      const nextActions = [...prev.actions, action];
      const nextRag = recalculateRAG(nextActions, prev.risks, prev.referenceDate, prev.ragAssessment);
      return {
        ...prev,
        actions: nextActions,
        ragAssessment: nextRag,
      };
    });
    showToast(`Added manual action item ${action.id}`);
  };

  const handleDeleteAction = (id: string) => {
    setState((prev) => {
      const nextActions = prev.actions.filter((a) => a.id !== id);
      const nextRag = recalculateRAG(nextActions, prev.risks, prev.referenceDate, prev.ragAssessment);
      return {
        ...prev,
        actions: nextActions,
        ragAssessment: nextRag,
      };
    });
    showToast(`Deleted action item ${id}`);
  };

  // Risk Register handlers
  const handleUpdateRisk = (id: string, updates: Partial<RiskItem>) => {
    setState((prev) => {
      const nextRisks = prev.risks.map((r) => (r.id === id ? { ...r, ...updates } : r));
      const nextRag = recalculateRAG(prev.actions, nextRisks, prev.referenceDate, prev.ragAssessment);
      return {
        ...prev,
        risks: nextRisks,
        ragAssessment: nextRag,
      };
    });
  };

  const handleAddRisk = (risk: RiskItem) => {
    setState((prev) => {
      const nextRisks = [...prev.risks, risk];
      const nextRag = recalculateRAG(prev.actions, nextRisks, prev.referenceDate, prev.ragAssessment);
      return {
        ...prev,
        risks: nextRisks,
        ragAssessment: nextRag,
      };
    });
    showToast(`Added risk item ${risk.id}`);
  };

  const handleDeleteRisk = (id: string) => {
    setState((prev) => {
      const nextRisks = prev.risks.filter((r) => r.id !== id);
      const nextRag = recalculateRAG(prev.actions, nextRisks, prev.referenceDate, prev.ragAssessment);
      return {
        ...prev,
        risks: nextRisks,
        ragAssessment: nextRag,
      };
    });
    showToast(`Deleted risk item ${id}`);
  };

  // Report handlers
  const handleUpdateRAG = (assessment: RAGAssessment) => {
    setState((prev) => ({
      ...prev,
      ragAssessment: assessment,
    }));
    showToast('Governance RAG status updated.');
  };

  const handleUpdateExecutiveSummary = (summary: string) => {
    setState((prev) => ({
      ...prev,
      executiveSummary: summary,
    }));
    showToast('Executive summary generated.');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 animate-fade-in flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Guardrail 3: Floating Undo/Revert Commit Toast Notification */}
      {isUndoToastVisible && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-5 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3.5 animate-fade-in max-w-lg w-full sm:w-auto">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium text-slate-100">
            {uiDict[language].committedSuccess}
          </span>
          <div className="h-4 w-px bg-slate-700 mx-1 shrink-0" />
          <button
            onClick={handleUndoCommit}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-md text-xs transition-colors cursor-pointer shadow-xs shrink-0 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{uiDict[language].undo}</span>
          </button>
          <button
            onClick={() => setIsUndoToastVisible(false)}
            className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer shrink-0 ml-auto"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {appScreen === 'welcome' ? (
        /* PAGE 1: Welcoming & Language Option */
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-blue-600 selection:text-white">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl w-full mx-auto text-center space-y-8 relative z-10 animate-fade-in">
            {/* Step & App Wordmark */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-950/80 border border-blue-800/80 rounded-full text-xs font-medium text-blue-300 mx-auto">
              <Rocket className="w-3.5 h-3.5 text-blue-400" />
              <span>{uiDict[language].step1Tag}</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                ProjectPilot<span className="text-blue-500">.AI</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 font-medium tracking-tight">
                {uiDict[language].subTitle}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                {uiDict[language].subDesc}
              </p>
            </div>

            {/* Language Selection: Direct pathway to Page 2 (Features & Instructions) */}
            <div className="space-y-3">
              <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                {uiDict[language].selectLangPrompt}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-xl mx-auto pt-1">
                <button
                  onClick={() => {
                    setLanguage('en');
                    try {
                      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'en');
                    } catch (e) {}
                    setAppScreen('features');
                    showToast('Language: English · Proceeding to Features & Instructions');
                  }}
                  className="flex-1 py-4 px-6 bg-slate-800 hover:bg-blue-600 hover:border-blue-500 border border-slate-700 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-blue-500/25 flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <span className="text-base group-hover:scale-105 transition-transform">{uiDict.en.continueEn}</span>
                  <span className="text-[11px] font-normal text-slate-400 group-hover:text-blue-100 font-mono">
                    {uiDict.en.pmiDefault}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setLanguage('es');
                    try {
                      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'es');
                    } catch (e) {}
                    setAppScreen('features');
                    showToast('Idioma: Español · Pasando a Características e Instrucciones');
                  }}
                  className="flex-1 py-4 px-6 bg-slate-800 hover:bg-emerald-600 hover:border-emerald-500 border border-slate-700 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-emerald-500/25 flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <span className="text-base group-hover:scale-105 transition-transform">{uiDict.es.continueEs}</span>
                  <span className="text-[11px] font-normal text-slate-400 group-hover:text-emerald-100 font-mono">
                    {uiDict.es.pmiEs}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setLanguage('fr');
                    try {
                      localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr');
                    } catch (e) {}
                    setAppScreen('features');
                    showToast('Langue: Français · Passage aux Fonctionnalités et Instructions');
                  }}
                  className="flex-1 py-4 px-6 bg-slate-800 hover:bg-indigo-600 hover:border-indigo-500 border border-slate-700 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-indigo-500/25 flex flex-col items-center gap-1.5 group cursor-pointer"
                >
                  <span className="text-base group-hover:scale-105 transition-transform">{uiDict.fr.continueFr}</span>
                  <span className="text-[11px] font-normal text-slate-400 group-hover:text-indigo-100 font-mono">
                    {uiDict.fr.pmiFr}
                  </span>
                </button>
              </div>
            </div>

            {/* Creator Attribution */}
            <div className="pt-6 border-t border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">
                {uiDict[language].createdByLabel}
              </p>
              <p className="text-[11px] text-slate-500">
                {uiDict[language].creatorRole}
              </p>
              <p className="text-[10px] font-mono text-slate-500 pt-1">
                {uiDict[language].versionPill(currentVersion)}
              </p>
            </div>
          </div>
        </div>
      ) : appScreen === 'features' ? (
        /* PAGE 2: General Features, Instructions, and Risk Framework Decision */
        <WelcomeScreen
          currentFramework={state.riskFramework}
          onSelectFramework={handleSelectFramework}
          onLaunchSimulation={handleLaunchSimulation}
          onClose={() => setAppScreen('workspace')}
          onBackToWelcome={() => setAppScreen('welcome')}
          hasExistingData={state.actions.length > 0 || state.risks.length > 0}
          activeProjectName={state.projectName}
          language={language}
          onSelectLanguage={(lang) => {
            setLanguage(lang);
            try {
              localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
            } catch (e) {}
            showToast(lang === 'es' ? 'Idioma: Español' : lang === 'fr' ? 'Langue: Français' : 'Language: English');
          }}
          currentVersion={currentVersion}
        />
      ) : (
        /* PAGE 3: Active Project Workspace */
        <>
          {/* Top Header & Navigation */}
          <Header
            state={state}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onUpdateProjectMeta={handleUpdateProjectMeta}
            onLoadAecon={handleLoadAecon}
            onLoadRioTinto={handleLoadRioTinto}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            onResetWorkspace={handleResetWorkspace}
            onOpenHelp={() => setIsHelpModalOpen(true)}
            onOpenInfo={() => setIsInfoModalOpen(true)}
            onSelectFramework={handleSelectFramework}
            onOpenWelcome={() => setAppScreen('features')}
            currentVersion={currentVersion}
            onOpenSaveSnapshot={handleOpenSaveSnapshot}
            onOpenVersionHistory={() => setIsHistoryModalOpen(true)}
            versionCount={versionHistory.length}
            language={language}
            onSelectLanguage={(lang) => {
              setLanguage(lang);
              showToast(lang === 'es' ? 'Idioma: Español' : lang === 'fr' ? 'Langue: Français' : 'Language: English');
            }}
            onOpenSecurityPurge={handleOpenSecurityPurge}
          />

          {/* Global Application Error Banner */}
          {appError && (
            <div className="bg-rose-50 border-b border-rose-300 px-4 py-3">
              <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-rose-900">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-700">Error:</span>
                  <span className="font-mono">{appError}</span>
                </div>
                <button
                  onClick={() => setAppError(null)}
                  className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Main Content Viewport */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'intake' && (
              <TabIntake
                key={activeNotesInput}
                referenceDate={state.referenceDate}
                currentActions={state.actions}
                currentRisks={state.risks}
                currentDecisions={state.decisions}
                initialNotes={activeNotesInput}
                language={language}
                onCommitUpdates={handleCommitUpdates}
                restoredStaging={restoredStaging}
              />
            )}

            {activeTab === 'actions' && (
              <TabActions
                actions={state.actions}
                referenceDate={state.referenceDate}
                language={language}
                onUpdateAction={handleUpdateAction}
                onAddAction={handleAddAction}
                onDeleteAction={handleDeleteAction}
              />
            )}

            {activeTab === 'risks' && (
              <TabRisks
                risks={state.risks}
                riskFramework={state.riskFramework}
                language={language}
                onUpdateRisk={handleUpdateRisk}
                onAddRisk={handleAddRisk}
                onDeleteRisk={handleDeleteRisk}
                onToggleFramework={handleSelectFramework}
              />
            )}

            {activeTab === 'report' && (
              <TabReport
                state={state}
                language={language}
                onUpdateRAG={handleUpdateRAG}
                onUpdateExecutiveSummary={handleUpdateExecutiveSummary}
              />
            )}
          </main>
        </>
      )}

      {/* Modal 1: Help / About Modal */}
      {isHelpModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsHelpModalOpen(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{uiDict[language].helpModal.title}</h3>
                  <p className="text-xs text-slate-500">{uiDict[language].helpModal.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Sections */}
            <div className="space-y-4 text-xs">
              {/* Section 1: How it Works */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Workflow className="w-4 h-4 text-blue-600 shrink-0" />
                  <h4>{uiDict[language].helpModal.sec1Title}</h4>
                </div>
                <p className="text-slate-600 leading-relaxed pl-6">
                  {uiDict[language].helpModal.sec1Desc}
                </p>
              </div>

              {/* Section 2: How to Use */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h4>{uiDict[language].helpModal.sec2Title}</h4>
                </div>
                <div className="text-slate-600 leading-relaxed pl-6 space-y-1">
                  {uiDict[language].helpModal.sec2Steps.map((step, idx) => (
                    <p key={idx}>{step}</p>
                  ))}
                </div>
              </div>

              {/* Section 3: Data Security & Privacy */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-semibold">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <h4>{uiDict[language].helpModal.sec3Title}</h4>
                </div>
                <p className="text-slate-600 leading-relaxed pl-6">
                  {uiDict[language].helpModal.sec3Desc}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                {uiDict[language].helpModal.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: App Info & Support Modal */}
      {isInfoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsInfoModalOpen(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{uiDict[language].infoModal.title}</h3>
                  <p className="text-xs text-slate-500">{uiDict[language].infoModal.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-medium">{uiDict[language].infoModal.appLabel}</span>
                <span className="font-semibold text-slate-900 text-right">{uiDict[language].infoModal.appName}</span>
              </div>

              <div className="flex items-start justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 font-medium">{uiDict[language].infoModal.versionLabel}</span>
                <span className="font-mono font-semibold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  {currentVersion}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{uiDict[language].infoModal.createdLabel}</span>
                </div>
                <p className="font-semibold text-slate-900 text-xs leading-relaxed">
                  {uiDict[language].infoModal.creatorName}
                </p>
                <p className="text-[11px] text-slate-500">
                  {uiDict[language].infoModal.creatorRole}
                </p>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 text-blue-900 font-medium">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>{uiDict[language].infoModal.contactTitle}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {uiDict[language].infoModal.contactDesc}
                </p>
                <a
                  href="mailto:caherrera710@gmail.com?subject=ProjectPilot%20AI%20Support%20Inquiry"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-xs transition-colors shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{uiDict[language].infoModal.contactBtn}</span>
                </a>
              </div>

              {/* Formal License & Copyright Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{uiDict[language].infoModal.licenseTitle}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {uiDict[language].infoModal.licenseDesc}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                {uiDict[language].infoModal.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Save Version Snapshot Modal */}
      {isSaveSnapshotModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSaveSnapshotModalOpen(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{uiDict[language].saveModal.title}</h3>
                  <p className="text-xs text-slate-500">{uiDict[language].saveModal.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSaveSnapshotModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-600 font-medium">{uiDict[language].saveModal.targetVer}</span>
                <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  {calculateNextVersion(currentVersion, isMajorRelease)}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {uiDict[language].saveModal.noteLabel}
                </label>
                <input
                  type="text"
                  value={snapshotChangeNote}
                  onChange={(e) => setSnapshotChangeNote(e.target.value)}
                  placeholder={uiDict[language].saveModal.notePlaceholder}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmSaveSnapshot();
                  }}
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {uiDict[language].saveModal.noteHint}
                </span>
              </div>

              {/* Major Release Checkbox */}
              <label className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/60 transition-colors">
                <input
                  type="checkbox"
                  checked={isMajorRelease}
                  onChange={(e) => setIsMajorRelease(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">{uiDict[language].saveModal.majorLabel}</span>
                  <span className="text-[11px] text-slate-500">
                    {uiDict[language].saveModal.majorDesc(
                      calculateNextVersion(currentVersion, true),
                      calculateNextVersion(currentVersion, false)
                    )}
                  </span>
                </div>
              </label>

              {/* Data Summary Preview */}
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-1">
                <span className="font-semibold text-blue-900 block">{uiDict[language].saveModal.currentRegs}</span>
                <div className="flex items-center gap-3 font-mono text-[11px] text-blue-700">
                  <span>Actions: <strong>{state.actions.length}</strong></span>
                  <span>·</span>
                  <span>Risks: <strong>{state.risks.length}</strong></span>
                  <span>·</span>
                  <span>Decisions: <strong>{state.decisions.length}</strong></span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsSaveSnapshotModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {uiDict[language].saveModal.cancel}
              </button>
              <button
                onClick={handleConfirmSaveSnapshot}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{uiDict[language].saveModal.confirm}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Version History Modal */}
      {isHistoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsHistoryModalOpen(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{uiDict[language].historyModal.title}</h3>
                  <p className="text-xs text-slate-500">
                    {uiDict[language].historyModal.subtitle(currentVersion)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content - Scrollable List/Table */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {versionHistory.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-lg space-y-3">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-slate-600 font-medium">{uiDict[language].historyModal.noSnapshots}</p>
                  <p className="text-slate-400 text-[11px] max-w-sm mx-auto">
                    {uiDict[language].historyModal.noSnapshotsDesc}
                  </p>
                  <button
                    onClick={() => {
                      setIsHistoryModalOpen(false);
                      handleOpenSaveSnapshot();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{uiDict[language].historyModal.createFirst}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {versionHistory.map((snapshot, index) => {
                    const isCurrent = snapshot.version === currentVersion;
                    const dateFormatted = new Date(snapshot.timestamp).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    });

                    return (
                      <div
                        key={`${snapshot.version}-${snapshot.timestamp}-${index}`}
                        className={`p-3.5 rounded-lg border transition-all ${
                          isCurrent
                            ? 'bg-blue-50/60 border-blue-200 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-900 text-white">
                                {snapshot.version}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
                                  {uiDict[language].historyModal.activeBadge}
                                </span>
                              )}
                              <span className="text-slate-400 text-[11px] font-mono">
                                {dateFormatted}
                              </span>
                            </div>
                            <p className="font-semibold text-slate-900 text-xs mt-1">
                              {snapshot.changeNote}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 pt-1">
                              <span>Actions: <strong className="text-slate-700">{snapshot.data.actions.length}</strong></span>
                              <span>·</span>
                              <span>Risks: <strong className="text-slate-700">{snapshot.data.risks.length}</strong></span>
                              <span>·</span>
                              <span>Decisions: <strong className="text-slate-700">{snapshot.data.decisions.length}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleRestoreSnapshot(snapshot)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
                              title={uiDict[language].historyModal.restoreTitle(snapshot.version)}
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>{uiDict[language].historyModal.restoreBtn}</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteSnapshot(snapshot.version, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title={uiDict[language].historyModal.deleteTitle}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                {uiDict[language].historyModal.totalBaselines(versionHistory.length)}
              </span>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                {uiDict[language].historyModal.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Double-Authenticated Enterprise Security Purge Modal */}
      {isSecurityPurgeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSecurityPurgeOpen(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-rose-300 max-w-lg w-full p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-950">{uiDict[language].purgeModal.title}</h3>
                  <p className="text-xs text-rose-700">{uiDict[language].purgeModal.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsSecurityPurgeOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warning Callout */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-rose-950">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Enterprise Sanitization Guardrail</span>
              </div>
              <p className="leading-relaxed text-[11px] text-rose-800">
                {uiDict[language].purgeModal.warning}
              </p>
            </div>

            {/* Double Authentication Factors */}
            <div className="space-y-4 text-xs">
              {/* Factor 1: Security Code Verification */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    {uiDict[language].purgeModal.factor1Title}
                  </span>
                  <span className="font-mono font-extrabold text-sm text-rose-700 bg-white border-2 border-rose-300 px-3 py-1 rounded shadow-xs tracking-widest">
                    {purgeSecurityCode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {uiDict[language].purgeModal.factor1Desc}
                </p>
                <input
                  type="text"
                  value={enteredPurgeCode}
                  onChange={(e) => setEnteredPurgeCode(e.target.value.trim())}
                  placeholder={uiDict[language].purgeModal.factor1Placeholder}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  autoFocus
                />
              </div>

              {/* Factor 2: Mandatory Explicit Checkbox Confirmation */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <span className="font-bold text-slate-900 block">
                  {uiDict[language].purgeModal.factor2Title}
                </span>
                <label className="flex items-start gap-2.5 cursor-pointer text-[11px] text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={purgeConfirmedCheckbox}
                    onChange={(e) => setPurgeConfirmedCheckbox(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer shrink-0"
                  />
                  <span className="leading-snug">
                    {uiDict[language].purgeModal.factor2Checkbox}
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsSecurityPurgeOpen(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {uiDict[language].purgeModal.cancel}
              </button>
              <button
                type="button"
                onClick={handleExecuteSecurityPurge}
                disabled={enteredPurgeCode.trim() !== purgeSecurityCode || !purgeConfirmedCheckbox}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{uiDict[language].purgeModal.confirmPurge}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Professional Sticky Footer */}
      {appScreen === 'workspace' && (
        <footer className="border-t border-slate-200 bg-white py-3.5 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-700">
              {uiDict[language].footer.brand}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {uiDict[language].footer.meta(currentVersion, state.riskFramework === 'PMI' ? 'PMI PMBOK®' : 'ISO 31000')}
            </span>
          </div>
          <div className="max-w-7xl mx-auto px-4 pt-1.5 text-center text-[11px] text-slate-400">
            © 2026 Cesar Herrera. {uiDict[language].footer.copyright}
          </div>
        </footer>
      )}
    </div>
  );
}
