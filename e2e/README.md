# End-to-end tests

These run against the **live Supabase project** configured in `.env.local` —
there is no local/disposable test database. That constrains what belongs
here:

- **Safe to run anytime, on every commit:** client-side validation, route
  guards/redirects, static content rendering, theme + responsive behavior.
  Nothing here writes data. This is what `e2e/*.spec.ts` covers.
- **Not included here:** the full signed-in order flow (register → browse →
  cart → checkout → place order). Running that on every CI run would create
  real rows (auth users, orders) in the shared project on every execution,
  with no cleanup path. Exercise that flow manually, or against a disposable
  Supabase project seeded via `supabase/schema.sql`, using a dedicated test
  account you control.

Run with:

```bash
npx playwright test
```

The config auto-starts `npm run dev` if it isn't already running.
