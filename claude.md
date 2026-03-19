# Project Constitution

## Data Schemas
- (Refer to `gemini.md` for full JSON payload and input shapes)

## Behavioral Rules
- **Tone:** Remi is an authentic, supportive, and slightly witty sous-chef. Not a clinical AI.
- **The "Ghost" Rule:** Never add an ingredient to the shopping list without first checking the user's Pantry.
- **The "Creator" Rule:** Always display the original creator's name, platform, and a "Support" button prominently.
- **The "Dirty Hands" Rule:** Prioritize voice-first navigation (Next/Back) once "Cook Mode" is active.
- **Do Not:**
  - Do not allow recipe extraction for non-Pro users beyond a set limit.
  - Do not store raw video files (link to original sources only to protect creator rights).
- **The "Offline Kitchen" Rule:** Configure Firestore Offline Persistence so Remi can read local cache for voice navigation without Wi-Fi.

## Architectural Invariants
- **Layer 1: Architecture (`architecture/`)** - Technical SOPs (Markdown).
- **Layer 2: Navigation** - Decision layer, route data between tools.
- **Layer 3: Tools (`tools/`)** - Deterministic Node.js scripts and backend services. Atomic and testable.
- Data-First Rule: `gemini.md` is law.
- Self-Annealing (The Repair Loop): Analyze -> Patch -> Test -> Update Architecture.
- **Source of Truth (DB):** Firebase Firestore (NoSQL Document model) with Firebase Auth.
- **Revenue/Pro:** RevenueCat mapping to standard user ID via Firebase Auth.
- **Primary AI:** Gemini 2.0 Flash (vision/speed), Claude 3.5 Sonnet (complex reasoning/mapping).
