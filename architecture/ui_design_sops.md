# UI & Design SOPs

## Visual Language: "Retro-Pop" System
- **Tone:** Playful, bold, and incredibly organized (modern cookbook meets streetwear brand).
- **Primary Accent (Lime Punch):** `#D4E95A` - Category highlights, primary action "pill" backgrounds.
- **Secondary Accent (Coral Heat):** `#F79ACC` - "Popular" tags, heart icons, illustrations.
- **Background Base (Soft Cream):** `#F6FBDE` - Warmer alternative to white.
- **Deep Charcoal:** `#313131` - Primary text, icons, "dark" buttons.
- **Subtle Pink:** Soft pink for differentiation on Recipe Detail pages.

## Typography
- **Primary Display Font:** Space Grotesk (Bold/Medium) - Headlines, recipe titles, large numeric callouts (e.g., Kcal). Technical yet quirky.
- **Secondary Body Font:** Inter or Helvetica Neue - Instructions, ingredient lists, metadata.

## Component Specifications
- **Floating Cards:** Very subtle or no drop shadows. They rely on clean color-blocking (e.g., contrasting internal blocks of pastel purple/peach against the cream background). Corner Radius: `32px`.
- **Buttons:** Pill Shape (`border-radius: 9999px`). Dark buttons (`#313131`) use white text.
- **Bottom Navigation:** A single, floating pill-shaped bar at the bottom. Dark charcoal background (`#313131`) with light thin-stroke line icons (home, recipes, favorites, profile).
- **Illustrations:** Flat, bold "sticker-style" in vibrant colors (e.g., red and orange chef illustrations for onboarding/empty states).

## Screen Layouts
- **The Library Page:** 
  - Background: Soft Cream (`#F6FBDE`) or category-specific (e.g. Lime for Lunch).
  - Top: Circular category chips with illustrations (Lime Punch active state). 
  - Header: Bold Space Grotesk counter (e.g., "172 lunches").
  - Recipe Cards: Clean layouts where the top half contains a 1:1 image paired with a solid pastel color block (containing tags like 'Classic' or 'Popular'). Below this block sits the recipe title, description, and small pill-shaped metadata badges (Rating, Time, Difficulty) colored with matching pastels.
- **The Recipe Detail Page:** 
  - Background: Soft Pink (differentiating from lists).
  - Hero Image: A circular "Plate View" full-color image centered at top, often bleeding slightly into the header.
  - Macro Grid: A 3-column minimalist table for P/F/C (thin charcoal borders, numbers and labels left-aligned).
  - Step Indicators: Solid dark charcoal circles containing white numbers.

## Behavioral Rules
- **"Sticker" Transitions:** Pop animations rather than sliding fades.
- **Dynamic Backgrounds:** Subtly change based on category (Green = Lunch, Pink = Dinner).
- **Cook Mode (Command Center):** Maintain a dark charcoal theme for high contrast under harsh kitchen lights.
