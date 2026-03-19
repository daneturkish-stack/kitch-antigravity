# Findings

## Project Discovery & Context
- **North Star:** Permanent, AI-enhanced "Source of Truth" for home cook digital libraries, translating TikTok/IG/YouTube videos to executable recipes.
- **Key Features & Screens:**
  1. **The Library (The "Vault"):** Visual grid of food-forward cards with AI Vibe tags, Smart Filters (Pantry-match, Time, Dietary), and a Quick Add FAB.
  2. **Recipe Detail Screen:** High-fidelity source of truth. Includes AI Gap Filler (flagged inferred measurements/steps), Ingredient-Pantry Check, and Scale & Convert sizing.
  3. **The Pantry (Inventory Control):** Aisle Grouping, AI-predicted Expiry Tracking, and "Remi recommends" auto-suggestions for recipes you haven't cooked yet.
  4. **Remi AI (The "Chat Lab"):** Conversational interface for Meal Planning, Real-time Substitutions, and Pro-Active prep tips.
  5. **Profile & Preferences:** Dietary DNA (exclusions), RevenueCat Hub for Pro subscription/stats, and Hardware Sync.
  6. **Cooking Mode (The "Command Center"):** High-contrast, hands-free environment. Pinned Video Sync (auto-seeking), Voice Navigation ("Remi, next step"), and Kitchen Timers with voice/haptic alerts.
- **Integrations:**
  - RevenueCat (appl_ and goog_ keys)
  - YouTube IFrame API
  - Gemini 2.0 Flash & Claude 3.5 Sonnet
  - Native TikTok/Instagram URL extraction modules
- **Infrastructure Constraints:**
  - Firebase Firestore for Document-based NoSQL data, enabling real-time Snapshot Listeners and Offline Persistence. node.js/Cloud Run for backend scraping/services.
  - Native Mobile App (iOS/Android) context as the delivery payload (Expo / React Native / Flutter / SwiftUI context assumed based on ecosystem).

## Research Notes
- **TikTok Scrapers**: 
  - `pyktok` (Python module to collect video, text, metadata directly from TikTok pages).
  - `yt-dlp` (Generic and very reliable for downloading TikTok videos).
- **Instagram Scrapers**:
  - `Instaloader` (Widely used Python tool for downloading IG pictures, videos, captions, and metadata).
- **RevenueCat Integration**:
  - The standard robust approach is using **Webhooks**. RevenueCat handles subscriptions and sends webhooks to a Cloud Run or Firebase Cloud Functions API endpoint.
  - The API endpoint parses the webhook and updates user entitlements in Firestore via the Firebase Admin SDK.
