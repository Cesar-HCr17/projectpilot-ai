# ProjectPilot AI 

**Intelligent Project Controls & Governance**
*Created by Cesar Augusto Herrera Calderon | Industrial Engineer & Risk Management Professional*

## Overview
ProjectPilot AI is a production-grade portfolio application designed to solve a critical operational bottleneck in heavy civil construction and industrial mining: the loss of critical project data between site meetings and official project trackers. 

Instead of acting as a generic "AI summarizer," ProjectPilot AI functions as a strict **Staging Gate**. It extracts proposed tasks, unresolved questions, and active blockers from unstructured meeting notes, explicitly flags missing accountability (e.g., unassigned owners or vague deadlines), and requires human validation before committing data to the live registers. 

## Business Value & Key Features
* **Human-in-the-Loop Governance:** AI extractions are staged for review. Nothing enters the Action Tracker or Risk Register without explicit human approval.
* **ISO 31000 Risk Alignment:** Automatically distinguishes between future *Risks*, realized *Issues*, and active *Blockers*, calculating a standard Probability x Impact score.
* **Context-Aware Updates (Diffing):** Reads the current state of the project and proposes updates to existing tasks (e.g., changing status to "Completed") rather than creating duplicates.
* **Deterministic RAG Status:** Calculates overall project health (Red/Amber/Green) using hard-coded operational rules, ensuring the AI-generated Executive Summary is strictly grounded in data.
* **Multilingual Field Support:** Instantly processes and translates project data across English, Spanish, and French to support multi-national Integrated Project Delivery (IPD) teams.

## Embedded Industry Simulations
The application includes built-in, multi-week simulation data demonstrating complex project control scenarios:
1. **Aecon Infrastructure (Nuclear & Heavy Civil):** Demonstrates compliance tracking, IPD joint-venture coordination (Pomerleau/Stantec), SAP requisition blockers, and conflicting schedule identification.
2. **Rio Tinto (Mining & Metals):** Demonstrates high-altitude camp expansion logistics, environmental permitting bottlenecks, and international supply chain delays in Argentina.

## Technical Architecture
* **Frontend:** React, TypeScript, Tailwind CSS, Vite
* **AI Engine:** Google Gemini 2.5 Flash (`@google/genai` SDK) utilizing Strict Structured Outputs (JSON Schema)
* **Data Privacy:** 100% client-side `localStorage` state management (zero backend data retention)
* **Hosting:** Vercel

## License & Copyright
Copyright (c) 2026 Cesar Herrera. All rights reserved. 
This software is provided strictly for portfolio demonstration and evaluation purposes. Unauthorized commercial use, reproduction, or distribution is prohibited.
