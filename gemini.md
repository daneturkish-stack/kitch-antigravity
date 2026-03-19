# System Schema & Maintenance Log

## JSON Data Schema

**Input Shape (Video URL Submission):**
```json
{
  "source_url": "string (TikTok/IG/YouTube)",
  "user_id": "uuid",
  "is_pro_user": "boolean"
}
```

**Output Shape (Recipe Card Payload):**
```json
{
  "recipe_id": "uuid",
  "original_url": "string",
  "creator": {
    "name": "string",
    "platform": "string",
    "support_url": "string (optional)"
  },
  "title": "string",
  "ingredients": [
    {
      "name": "string",
      "quantity": "number",
      "unit": "string",
      "in_pantry": "boolean",
      "aisle_category": "string",
      "required_substitutes": ["string"],
      "is_ai_generated": "boolean (optional)"
    }
  ],
  "steps": [
    {
      "step_number": "integer",
      "instruction": "string",
      "is_ai_generated": "boolean (optional)"
    }
  ],
  "vibe_tags": ["string"],
  "sync_timestamps": ["number (optional)"]
}
```

## Firestore Schema Structure
- **users (Collection):** Profile data, Dietary DNA, RevenueCat appUserID.
  - **pantry (Sub-collection):** Real-time inventory items.
- **recipes (Collection):** Recipe documents containing instructions, ingredients, Aisle IDs, and sync-timestamps.

## Rules & Handlers
- **The Ghost Rule:** Use a Firestore Snapshot Listener on the `pantry` sub-collection. Items sync instantly and "Ghost out" (35% opacity) on the Shopping List.
- **AI Metadata Tagging:** Fields inferred by AI get `is_ai_generated: true`. UI must show a "Remi Note" icon next to them.
- **The Creator Rule:** Output payload strictly maps original creator details.
- **The Dirty Hands Rule:** App router prioritizes voice handlers for navigation in "Cook Mode".
- **Free Tier Limit Handler:** Abort extraction task if `is_pro_user` is false and limit reached.
- **Media Preservation:** Only proxy or reference URLs, do not blob store raw videos.

## Maintenance Log
- System Initialized.
- Discovery Phase completed; schemas defined.
