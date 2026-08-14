# 📌 FoodIQ - Future Scale & Architecture Roadmap (TODO)

This document tracks technical improvements and architectural upgrades reserved for future scaling (beyond the initial 20–30 user beta phase).

---

## 🚀 High-Scale Optimization Backlog

### 1. Atomic Order Locking (`place_order` SQL RPC)
- **Goal**: Prevent inventory overselling during peak ordering rushes.
- **Action**: Move order placement from client-side insert to a Supabase SQL RPC function with `SELECT FOR UPDATE` on daily menu quantities.

### 2. Automated Payment Gateway Webhooks
- **Goal**: Automate payment verification at scale.
- **Action**: Integrate Razorpay / Cashfree Edge Functions with webhook signature verification to replace manual QR/UPI verification.

### 3. Realtime Supabase WebSockets
- **Goal**: Push live order updates instantly to admin kitchen desk and customer tracking.
- **Action**: Subscribe to `postgres_changes` on the `orders` table in real-time.

### 4. Modular Monorepo Setup (Turborepo)
- **Goal**: Share types, API clients, and UI components cleanly between `foodIQ_admin` and `foodIQ_web`.
- **Action**: Migrate to PNPM workspace / Turborepo monorepo structure.

### 5. Feature Public API Boundaries (`index.ts` Barrel Exports)
- **Goal**: Encapsulate feature implementation details.
- **Action**: Add `index.ts` files to all feature modules in `src/features/`.
