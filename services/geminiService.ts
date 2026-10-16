// Copyright (c) 2026 Cesar Herrera.
// All rights reserved.
// This code is provided for portfolio demonstration purposes.

import { GoogleGenAI } from "@google/genai";
import { ActionItem, RiskItem, StagingExtractionResult } from "../src/types";

/**
 * Lazy initialization of GoogleGenAI client.
 * Retrieves key from process.env.GEMINI_API_KEY or import.meta.env.VITE_GEMINI_API_KEY.
 * Avoids crashing the app on startup if no key is present in the browser environment.
 */
function getGeminiClient(): GoogleGenAI {
  const apiKey =
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
    '';

  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      "Gemini API key is not configured. Please set GEMINI_API_KEY in your environment or Secrets panel to enable AI extraction."
    );
  }

  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

const EXTRACTION_SYSTEM_INSTRUCTION = `You are ProjectPilot AI, an elite industrial engineering & project governance intelligence system.
Your mission is to parse raw, messy meeting notes and site logs into high-integrity project registers aligned with ISO 31000 risk standards.

STRICT GOVERNANCE RULES:
1. NEVER INVENT OR HALLUCINATE task owners, deadlines, or decisions.
   - If an owner is missing or vague ("someone", "civil team"), set owner to null or "", explain in validationNotes, and set epistemicStatus to "Needs Clarification".
   - If a deadline is missing or vague ("ASAP", "soon", "next week"), set dueDate to null or "", explain in validationNotes, and set epistemicStatus to "Needs Clarification".
   - If an explicit person and calendar date are stated, set epistemicStatus to "Confirmed".
2. UNRESOLVED QUESTIONS:
   - Convert any open/unresolved questions into newActions prefixed with "Clarify / Resolve: ", with owner: null, dueDate: null, and epistemicStatus: "Needs Clarification".
3. CONTEXT-AWARE DIFFING:
   - Inspect currentActions and currentRisks lists.
   - If the notes describe progress, completion, or changes to an EXISTING action item, do NOT create a duplicate action. Instead, output a proposedActionUpdates item referencing the exact targetActionId (e.g., "ACT-001").
   - If the notes update an existing risk, output a proposedRiskUpdates item referencing the exact targetRiskId (e.g., "RSK-001").
4. ISO 31000 RISK VS ISSUE VS BLOCKER:
   - "Risk": A future uncertain event with probability 1-4.
   - "Issue": A realized problem currently occurring. Probability MUST be 5.
   - "Blocker": An active impediment directly halting progress. Probability MUST be 5.
   - For all newly identified risks/issues where you generate the mitigation plan, ALWAYS set isMitigationAIProposed to true.
5. AMBIGUITIES & CONTRADICTIONS:
   - Identify conflicting dates or opposing statements (e.g., one subcontractor claims completion Oct 20 while another states Oct 28). Add an explicit warning string into ambiguitiesAndContradictions.
6. INSUFFICIENT INPUT:
   - If the input is empty or lacks actionable project content, set isSufficientInput to false and explain in insufficiencyReason.

OUTPUT FORMAT:
Respond ONLY with a valid JSON object matching this exact structure:
{
  "isSufficientInput": true,
  "insufficiencyReason": null,
  "ambiguitiesAndContradictions": [],
  "newActions": [
    {
      "title": "Clear action deliverable",
      "owner": "Person Name" or null,
      "dueDate": "YYYY-MM-DD" or null,
      "status": "Not Started" | "In Progress" | "Blocked" | "Completed",
      "dependencies": "None",
      "epistemicStatus": "Confirmed" | "AI Suggestion" | "Needs Clarification",
      "validationNotes": "Reason if owner or dueDate is null or missing" or null,
      "sourceQuote": "Direct quote from notes"
    }
  ],
  "proposedActionUpdates": [
    {
      "targetActionId": "ACT-001",
      "proposedStatus": "Completed",
      "proposedDueDate": "YYYY-MM-DD",
      "proposedOwner": "Name",
      "reasonAndQuote": "Quote and explanation"
    }
  ],
  "newRisksAndIssues": [
    {
      "category": "Risk" | "Issue" | "Blocker",
      "description": "Concrete risk/issue description",
      "owner": "Owner Name" or null,
      "probability": 1 to 5,
      "impact": 1 to 5,
      "strategy": "Avoid" | "Mitigate" | "Transfer" | "Accept",
      "mitigationPlan": "Actionable mitigation steps",
      "isMitigationAIProposed": true,
      "status": "Open" | "Monitoring" | "Resolved",
      "epistemicStatus": "Confirmed" | "AI Suggestion" | "Needs Clarification",
      "sourceQuote": "Quote from notes"
    }
  ],
  "proposedRiskUpdates": [
    {
      "targetRiskId": "RSK-001",
      "proposedStatus": "Open" | "Monitoring" | "Resolved",
      "reasonAndQuote": "Reason citing note quote"
    }
  ],
  "extractedDecisions": [
    {
      "decision": "Agreed decision",
      "sourceQuote": "Source quote"
    }
  ]
}`;

/**
 * Extracts validated actions, risks, updates, and decisions from meeting notes.
 * Uses gemini-flash-latest with JSON mode.
 */
export async function extractProjectUpdates(
  notes: string,
  referenceDate: string,
  currentActions: ActionItem[],
  currentRisks: RiskItem[],
  language: 'en' | 'es' | 'fr' = 'en'
): Promise<StagingExtractionResult> {
  const trimmed = notes.trim();
  if (!trimmed || trimmed.length < 15) {
    return {
      isSufficientInput: false,
      insufficiencyReason: "Input notes are too brief or empty to extract project records.",
      ambiguitiesAndContradictions: [],
      newActions: [],
      proposedActionUpdates: [],
      newRisksAndIssues: [],
      proposedRiskUpdates: [],
      extractedDecisions: [],
    };
  }

  try {
    const langDirective = `\n\nCRITICAL LANGUAGE INSTRUCTION: The user interface is currently set to ${
      language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : 'English'
    }. You MUST write all generated text, summaries, extracted titles, descriptions, mitigation plans, validation notes, and decisions in this exact language, regardless of the language of the original meeting notes. Leave the 'sourceQuote' in its original language.`;

    const prompt = `REFERENCE DATE: ${referenceDate}

CURRENT EXISTING ACTION ITEMS:
${JSON.stringify(currentActions, null, 2)}

CURRENT EXISTING RISK REGISTER:
${JSON.stringify(currentRisks, null, 2)}

RAW MEETING NOTES & LOGS TO ANALYZE:
---
${notes}
---

Extract all updates, new actions, risks/issues, and decisions. Return ONLY a valid JSON object matching the requested schema.`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION + langDirective,
        responseMimeType: "application/json",
        temperature: 0.1,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Gemini returned an empty response text.");
    }

    const parsed = JSON.parse(responseText) as StagingExtractionResult;
    return sanitizeExtractionResult(parsed);
  } catch (error: any) {
    console.error("Gemini API call failed in extractProjectUpdates:", error);
    const detailedMessage = error?.message || (typeof error === "string" ? error : JSON.stringify(error));
    throw new Error(detailedMessage || "Failed to call the Gemini API: Unknown error");
  }
}

/**
 * Generates a grounded 2-paragraph executive summary citing exact IDs.
 * Uses gemini-flash-latest.
 */
export async function generateExecutiveSummary(
  projectData: any,
  language: 'en' | 'es' | 'fr' = 'en'
): Promise<string> {
  try {
    const langTarget = language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : 'English';
    const prompt = `You are a Lead Project Governance Officer.
Write a concise, professional 2-paragraph executive summary of the current project status based strictly on the JSON data below.

REQUIREMENTS:
- First paragraph: Summarize overall progress, total open actions, completion rate, and active schedule status.
- Second paragraph: Detail critical risks, blockers, and items requiring clarification. Cite exact item IDs (such as ACT-001, RSK-001) in parentheses.
- Strictly Grounded: NEVER invent milestones, budgets, or team members outside of the provided JSON data.
- CRITICAL LANGUAGE INSTRUCTION: You MUST write the entire executive summary in ${langTarget}.

PROJECT JSON STATE:
${JSON.stringify(projectData, null, 2)}`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction: `You are an executive project controls analyst. Be strictly grounded, concise, and cite IDs directly. CRITICAL LANGUAGE INSTRUCTION: You MUST write the entire executive summary in ${langTarget}.`,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (text && text.trim().length > 0) {
      return text.trim();
    }
    throw new Error("Gemini returned empty text for executive summary.");
  } catch (error: any) {
    console.error("Gemini API call failed in generateExecutiveSummary:", error);
    const detailedMessage = error?.message || (typeof error === "string" ? error : JSON.stringify(error));
    throw new Error(detailedMessage || "Failed to generate executive summary");
  }
}

/**
 * Sanitizes and validates the extracted result to guarantee strict typing
 * and treats empty string / null owners or dates as missing (Needs Clarification).
 */
function sanitizeExtractionResult(res: Partial<StagingExtractionResult>): StagingExtractionResult {
  return {
    isSufficientInput: res.isSufficientInput ?? true,
    insufficiencyReason: res.insufficiencyReason ?? null,
    ambiguitiesAndContradictions: Array.isArray(res.ambiguitiesAndContradictions) ? res.ambiguitiesAndContradictions : [],
    newActions: (res.newActions || []).map((a) => {
      const rawOwner = a.owner && typeof a.owner === "string" && a.owner.trim().length > 0 ? a.owner.trim() : null;
      const rawDueDate = a.dueDate && typeof a.dueDate === "string" && a.dueDate.trim().length > 0 ? a.dueDate.trim() : null;
      const isMissingAttribution = !rawOwner || !rawDueDate;
      const epistemicStatus = isMissingAttribution ? "Needs Clarification" : (a.epistemicStatus || "Confirmed");
      
      let valNotes = a.validationNotes || null;
      if (isMissingAttribution && !valNotes) {
        valNotes = !rawOwner && !rawDueDate ? "Missing assigned owner and due date" : !rawOwner ? "Missing assigned owner" : "Missing due date";
      }

      return {
        title: a.title || "Untitled Action",
        owner: rawOwner,
        dueDate: rawDueDate,
        status: a.status || "Not Started",
        dependencies: a.dependencies || "None",
        epistemicStatus,
        validationNotes: valNotes,
        sourceQuote: a.sourceQuote || "",
      };
    }),
    proposedActionUpdates: (res.proposedActionUpdates || []).map((u) => ({
      targetActionId: u.targetActionId || "",
      proposedStatus: u.proposedStatus,
      proposedDueDate: u.proposedDueDate && u.proposedDueDate.trim().length > 0 ? u.proposedDueDate : undefined,
      proposedOwner: u.proposedOwner && u.proposedOwner.trim().length > 0 ? u.proposedOwner : undefined,
      reasonAndQuote: u.reasonAndQuote || "",
    })),
    newRisksAndIssues: (res.newRisksAndIssues || []).map((r) => {
      const cat = r.category || "Risk";
      const prob = (cat === "Issue" || cat === "Blocker") ? 5 : ((r.probability ?? 3) as 1 | 2 | 3 | 4 | 5);
      return {
        category: cat,
        description: r.description || "Unspecified risk",
        owner: r.owner && r.owner.trim().length > 0 ? r.owner.trim() : null,
        probability: prob,
        impact: (r.impact ?? 3) as 1 | 2 | 3 | 4 | 5,
        strategy: r.strategy || "Mitigate",
        mitigationPlan: r.mitigationPlan || "Pending mitigation definition",
        isMitigationAIProposed: r.isMitigationAIProposed ?? true,
        status: r.status || "Open",
        epistemicStatus: r.epistemicStatus || "Needs Clarification",
        sourceQuote: r.sourceQuote || "",
      };
    }),
    proposedRiskUpdates: (res.proposedRiskUpdates || []).map((ru) => ({
      targetRiskId: ru.targetRiskId || "",
      proposedStatus: ru.proposedStatus || "Open",
      reasonAndQuote: ru.reasonAndQuote || "",
    })),
    extractedDecisions: (res.extractedDecisions || []).map((d) => ({
      decision: d.decision || "",
      sourceQuote: d.sourceQuote || "",
    })),
  };
}
