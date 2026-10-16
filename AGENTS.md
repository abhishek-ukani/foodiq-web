# FoodIQ Web - Project Instructions

## Mobile-First Architecture & Design Principles

1. **Mobile-First Priority**:
   - We build the website for **mobile-first**. Always ensure every screen, component, modal, and navigation flow is tailored, tested, and best fit for mobile devices (360px – 430px viewports).
   - Touch targets must be at least 44px for accessibility.
   - Text, spacing, and buttons must be comfortable to view and tap on phone screens without awkward horizontal scrolling or cramped wrapping.

2. **Adaptive & Dedicated Mobile UI**:
   - Strive for clean, modern responsive design with Tailwind breakpoints (`sm:`, `md:`, `lg:`).
   - If responsive layouts become compromised, cluttered, or difficult to keep clean on mobile, create a **separate UI component for mobile view** (e.g. using responsive containers or conditional rendering for mobile vs desktop views).

3. **Customer-Centric UX**:
   - Prioritize what the customer actually cares about: dish names, food imagery, price, delivery status, quick reordering, and ratings.
   - Avoid technical or administrative jargon (e.g., raw UUIDs or long cryptic order numbers) as primary titles.
