# FoodIQ Project Instructions

## Mobile-First Priority & Guidelines

1. **Mobile-First Development**:
   - Always build and optimize the website for **mobile first** (360px – 430px viewports).
   - Ensure all touch targets are comfortable (minimum 44px height/width).
   - Card layouts, typography, button groups, and lists must look cohesive and native on mobile screens without horizontal clipping or awkward wrapping.

2. **Dedicated Mobile UI When Needed**:
   - Strive for clean responsive Tailwind utilities (`sm:`, `md:`, `lg:`).
   - If a responsive layout becomes too cluttered or compromised on small screens, build a **dedicated UI component for mobile view** (e.g., `<MobileOrderCard />` vs `<DesktopOrderCard />` or responsive branching) to provide the best possible mobile user experience.

3. **Customer-First Information Architecture**:
   - Highlight what customers care about most: item names, food photos, order summary, total price, delivery status, easy one-tap reordering, and ratings.
   - Demote technical identifiers (e.g. order IDs / hash strings) to small, secondary reference text.
