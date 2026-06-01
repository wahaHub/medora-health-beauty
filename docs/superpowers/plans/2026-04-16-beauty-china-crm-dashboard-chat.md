# Beauty / China CRM-First Dashboard & Chat Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `medora-health-beauty` to China-level patient dashboard and chat capability while keeping Beauty and China identities isolated and sharing CRM-owned chat/dashboard logic.

**Architecture:** Treat `medical-crm-v2` as the authoritative backend for patient session, chatbot, and dashboard contracts. Keep `medora-health-beauty` and `china-medical-journeys` as separate frontend shells that inject a fixed site context (`beauty` or `china`) into CRM calls so brand-specific FAQ, hospital pool, packages, and copy stay separated.

**Tech Stack:** Hono + Vitest in `medical-crm-v2`; Vite + React + React Router + TanStack Query + Vitest in `medora-health-beauty`; Vite + React + TanStack Query + Vitest in `china-medical-journeys`

---

## File Structure

### `medical-crm-v2`

- Create: `medical-crm-v2/apps/api/src/patient-site-context.ts`
  Resolves and validates the site context for patient-facing requests.
- Modify: `medical-crm-v2/apps/api/src/middleware/security.ts`
  Allow the site context header through CORS for cross-origin Beauty and China traffic.
- Modify: `medical-crm-v2/packages/application/src/use-cases/patient-onboarding/init-onboarding.use-case.ts`
  Make onboarding identity resolution site-aware.
- Modify: `medical-crm-v2/packages/application/src/use-cases/patient-auth/send-patient-login-link.use-case.ts`
  Make login-link delivery site-aware.
- Modify: `medical-crm-v2/packages/application/src/use-cases/patient-auth/verify-magic-link.use-case.ts`
  Make magic-link verification site-aware.
- Modify: `medical-crm-v2/packages/application/src/use-cases/patient-auth/restore-guest-session.use-case.ts`
  Make guest-session restore site-aware.
- Modify: `medical-crm-v2/apps/api/src/routes/patient-public.routes.ts`
  Bind onboarding and pre-auth patient entry to the current site context.
- Modify: `medical-crm-v2/apps/api/src/routes/patient-auth.routes.ts`
  Bind magic-link, login, verify-token, and restore-session to the current site context.
- Modify: `medical-crm-v2/apps/api/src/routes/patient-protected.routes.ts`
  Scope `/me`, cases, conversations, orders, tickets, journey, and AI summary to site context.
- Modify: `medical-crm-v2/apps/api/src/routes/chatbot.routes.ts`
  Scope chatbot v2 session creation, lookup, and turn processing to site context.
- Modify: `medical-crm-v2/apps/api/src/routes/chatbot-v3.routes.ts`
  Scope chatbot v3 runtime access to site context.
- Modify: `medical-crm-v2/apps/api/src/ws/patient-ws.ts`
  Reject patient websocket access when session/site context mismatches.
- Test: `medical-crm-v2/apps/api/src/__tests__/security.test.ts`
- Test: `medical-crm-v2/packages/application/__tests__/patient-onboarding/init-onboarding.test.ts`
- Test: `medical-crm-v2/packages/application/__tests__/patient-auth/send-patient-login-link.test.ts`
- Test: `medical-crm-v2/packages/application/__tests__/patient-auth/verify-magic-link.test.ts`
- Test: `medical-crm-v2/packages/application/__tests__/patient-auth/restore-guest-session.test.ts`
- Test: `medical-crm-v2/apps/api/src/__tests__/patient-public.routes.test.ts`
- Test: `medical-crm-v2/apps/api/src/__tests__/patient-auth.routes.test.ts`
- Test: `medical-crm-v2/apps/api/src/__tests__/chatbot.routes.test.ts`
- Test: `medical-crm-v2/apps/api/src/__tests__/chatbot-v3.mounting.test.ts`
- Test: `medical-crm-v2/apps/api/src/__tests__/patient-protected.routes.test.ts`

### `medora-health-beauty`

- Create: `api/patient/[...path].js`
  Production BFF/proxy that forwards Beauty patient traffic to CRM and injects `x-medora-site: beauty`.
- Create: `test/BeautyPatientProxy.forwarding.test.ts`
  Verifies the proxy preserves path, query string, cookies, status/body, and CRM `Set-Cookie` headers.
- Create: `test/Header.patient-auth.test.tsx`
  Verifies Beauty header shows `Login` vs `Dashboard` and keeps language controls.
- Create: `test/PatientAuthContext.site-scope.test.tsx`
  Verifies Beauty patient auth restores only Beauty-scoped state.
- Create: `test/BeautyDashboardRoutes.test.tsx`
  Verifies Beauty exposes the China-equivalent dashboard IA.
- Create: `test/ChatWidget.crm-entry.test.tsx`
  Verifies widget/dashboard use the CRM-backed patient entry flow.
- Modify: `services/crmApiClient.ts`
  Keep Beauty storage/session keys Beauty-scoped and align request behavior with the new proxy model.
- Modify: `contexts/PatientAuthContext.tsx`
  Align restore/login/dashboard bootstrap semantics with China’s CRM-backed patient auth contract.
- Modify: `components/Header.tsx`
  Keep Beauty UI style but switch right-side behavior to `Login` / `Dashboard` + language selector.
- Modify: `components/LanguageSelector.tsx`
  Ensure it can sit next to the auth CTA without layout regressions.
- Modify: `components/ChatWidget.tsx`
  Replace the old widget shell with the CRM-first patient entry shell.
- Modify: `components/chat/ChatWindow.tsx`
  Host the new CRM-backed patient entry experience instead of the old onboarding-only flow.
- Modify: `contexts/PatientEntryContext.tsx`
  Reconcile widget state and dashboard messaging around CRM conversation truth.
- Modify: `pages/dashboard/DashboardLayout.tsx`
  Align tab inventory with China.
- Modify: `pages/dashboard/DashboardHome.tsx`
- Modify: `pages/dashboard/MessagesPage.tsx`
- Modify: `pages/dashboard/TicketsPage.tsx`
- Modify: `pages/dashboard/OrdersPage.tsx`
- Modify: `pages/dashboard/JourneyPage.tsx`
- Modify: `pages/dashboard/AiSummaryPage.tsx`
  Upgrade page behavior to the China-level patient IA while preserving Beauty styling.

### `china-medical-journeys`

- Modify: `medical-china-comb/china-medical-journeys/src/services/api/crmApiClient.ts`
  Make site context injection explicit and stable for China calls, and remove the legacy Beauty restore-token migration path.
- Modify: `medical-china-comb/china-medical-journeys/src/contexts/PatientAuthContext.tsx`
  Adjust only if CRM site-context enforcement changes bootstrap/restore semantics.
- Create: `medical-china-comb/china-medical-journeys/src/services/api/__tests__/crmApiClient.restore-token.test.ts`
- Test: `medical-china-comb/china-medical-journeys/src/contexts/__tests__/PatientAuthContext.test.tsx`
- Test: `medical-china-comb/china-medical-journeys/src/services/api/__tests__/patient-chatbot.test.ts`
- Test: `medical-china-comb/china-medical-journeys/src/pages/__tests__/DashboardRoute.test.tsx`

## Chunk 1: CRM Site Context Foundation

### Task 0: Make CRM CORS accept the site context header

**Files:**
- Modify: `medical-crm-v2/apps/api/src/middleware/security.ts`
- Test: `medical-crm-v2/apps/api/src/__tests__/security.test.ts`

- [ ] **Step 1: Write the failing CORS test**

Add assertions that cross-origin requests can preflight with `x-medora-site` in the allow-list.

```ts
const res = await app.request('/health', {
  method: 'OPTIONS',
  headers: {
    Origin: 'https://portal.medora.com',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type,x-medora-site',
  },
});

expect(res.headers.get('access-control-allow-headers')).toContain('x-medora-site');
```

- [ ] **Step 2: Run the auth route test to verify the new expectations fail**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 --filter @medical-crm/api test -- src/__tests__/security.test.ts
```

Expected: FAIL because `x-medora-site` is not yet in the allow-list.

- [ ] **Step 3: Implement the CORS allow-list change**

Update `medical-crm-v2/apps/api/src/middleware/security.ts` to allow `x-medora-site` in `allowHeaders`.

- [ ] **Step 4: Re-run the security test**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 --filter @medical-crm/api test -- src/__tests__/security.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 add apps/api/src/middleware/security.ts apps/api/src/__tests__/security.test.ts
git -C /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 commit -m "feat(api): allow patient site context header"
```

### Task 1: Add a single site-context resolver and make CRM auth/onboarding use cases site-aware

**Files:**
- Create: `medical-crm-v2/apps/api/src/patient-site-context.ts`
- Modify: `medical-crm-v2/packages/application/src/use-cases/patient-onboarding/init-onboarding.use-case.ts`
- Modify: `medical-crm-v2/packages/application/src/use-cases/patient-auth/send-patient-login-link.use-case.ts`
- Modify: `medical-crm-v2/packages/application/src/use-cases/patient-auth/verify-magic-link.use-case.ts`
- Modify: `medical-crm-v2/packages/application/src/use-cases/patient-auth/restore-guest-session.use-case.ts`
- Modify: `medical-crm-v2/apps/api/src/routes/patient-public.routes.ts`
- Modify: `medical-crm-v2/apps/api/src/routes/patient-auth.routes.ts`
- Test: `medical-crm-v2/packages/application/__tests__/patient-onboarding/init-onboarding.test.ts`
- Test: `medical-crm-v2/packages/application/__tests__/patient-auth/send-patient-login-link.test.ts`
- Test: `medical-crm-v2/packages/application/__tests__/patient-auth/verify-magic-link.test.ts`
- Test: `medical-crm-v2/packages/application/__tests__/patient-auth/restore-guest-session.test.ts`
- Test: `medical-crm-v2/apps/api/src/__tests__/patient-public.routes.test.ts`
- Test: `medical-crm-v2/apps/api/src/__tests__/patient-auth.routes.test.ts`

- [ ] **Step 1: Add failing route tests for site-scoped onboarding and restore**

Cover:
- onboarding/init binds a new patient session to the current site
- verify-token/restore-session reject tokens from the wrong site
- `/me` returns only the current-site patient profile

```ts
expect(json.site).toBe('beauty');
expect(resWrongSite.status).toBe(401);
```

- [ ] **Step 2: Run the focused identity tests**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 --filter @medical-crm/application test -- __tests__/patient-onboarding/init-onboarding.test.ts __tests__/patient-auth/send-patient-login-link.test.ts __tests__/patient-auth/verify-magic-link.test.ts __tests__/patient-auth/restore-guest-session.test.ts
```

Expected: FAIL on the new cross-site expectations until the use cases carry site context.

- [ ] **Step 3: Implement the site-context helper and thread it into patient routes**

Update onboarding and pre-auth patient entry flows so `resolvePatientSiteContext(c)` is read once and passed into the application boundary.

```ts
const site = resolvePatientSiteContext(c);
result = await initOnboarding.execute({
  ...onboardingInput,
  site,
});
```

- [ ] **Step 4: Extend the application use cases with site context**

The use cases listed above must stop doing global lookup by email or token. Thread site into the repository and auth-service calls they rely on so the same email can exist independently in Beauty and China.

Concrete contract changes may include:

- site-aware email state lookup
- site-aware patient lookup by email
- site-aware magic-link token verification
- site-aware guest restore verification

- [ ] **Step 5: Extend auth routes with site context**

Bind `/magic-link`, `/verify-token`, `/login`, and `/session/restore` to the current site so session/restore cookies only unlock the matching site context.

- [ ] **Step 6: Extend protected routes with site context**

Apply the same site-boundary to `/me`, `/cases`, `/conversations`, `/orders`, `/tickets`, `/journey`, and `/ai-summary`. If the underlying use-case already understands site/tenant boundaries, pass the site key through; if not, add the minimum parameter to do so.

- [ ] **Step 7: Re-run the patient route and application suites**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 --filter @medical-crm/api test -- src/__tests__/patient-public.routes.test.ts src/__tests__/patient-auth.routes.test.ts src/__tests__/patient-protected.routes.test.ts
pnpm --dir /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 --filter @medical-crm/application test -- __tests__/patient-onboarding/init-onboarding.test.ts __tests__/patient-auth/send-patient-login-link.test.ts __tests__/patient-auth/verify-magic-link.test.ts __tests__/patient-auth/restore-guest-session.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git -C /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 add apps/api/src/patient-site-context.ts apps/api/src/routes/patient-public.routes.ts apps/api/src/routes/patient-auth.routes.ts apps/api/src/routes/patient-protected.routes.ts packages/application/src/use-cases/patient-onboarding/init-onboarding.use-case.ts packages/application/src/use-cases/patient-auth/send-patient-login-link.use-case.ts packages/application/src/use-cases/patient-auth/verify-magic-link.use-case.ts packages/application/src/use-cases/patient-auth/restore-guest-session.use-case.ts apps/api/src/__tests__/patient-public.routes.test.ts apps/api/src/__tests__/patient-auth.routes.test.ts apps/api/src/__tests__/patient-protected.routes.test.ts packages/application/__tests__/patient-onboarding/init-onboarding.test.ts packages/application/__tests__/patient-auth/send-patient-login-link.test.ts packages/application/__tests__/patient-auth/verify-magic-link.test.ts packages/application/__tests__/patient-auth/restore-guest-session.test.ts
git -C /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 commit -m "feat(api): scope patient identity by site context"
```

### Task 3: Thread site context through chatbot v2/v3 and patient websocket access

**Files:**
- Modify: `medical-crm-v2/apps/api/src/routes/chatbot.routes.ts`
- Modify: `medical-crm-v2/apps/api/src/routes/chatbot-v3.routes.ts`
- Modify: `medical-crm-v2/apps/api/src/ws/patient-ws.ts`
- Test: `medical-crm-v2/apps/api/src/__tests__/chatbot.routes.test.ts`
- Test: `medical-crm-v2/apps/api/src/__tests__/chatbot-v3.mounting.test.ts`

- [ ] **Step 1: Add failing chatbot tests for cross-site rejection**

Add coverage for:
- creating a chatbot session under `beauty`
- attempting to resume it under `china`
- ensuring CRM rejects the cross-site access instead of silently reusing the session

```ts
expect(res.status).toBe(403);
expect(json.error).toMatch(/site/i);
```

- [ ] **Step 2: Run only the chatbot suites**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 --filter @medical-crm/api test -- src/__tests__/chatbot.routes.test.ts src/__tests__/chatbot-v3.mounting.test.ts
```

Expected: FAIL on the new site-boundary expectations.

- [ ] **Step 3: Bind chatbot session lookup/creation to site context**

Update v2 and v3 routes so the route-level site context is carried into:
- session bootstrap
- session lookup
- patient-cookie attachment
- post-turn history lookup

Minimal pattern:

```ts
const site = resolvePatientSiteContext(c);
session = await services.aiChatSessionRepo.findBySessionIdAndSite(body.sessionId, site);
```

- [ ] **Step 4: Bind patient websocket access to site context**

Reject websocket upgrades when the patient session and request site do not match.

- [ ] **Step 5: Re-run the chatbot suites**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 --filter @medical-crm/api test -- src/__tests__/chatbot.routes.test.ts src/__tests__/chatbot-v3.mounting.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git -C /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 add apps/api/src/routes/chatbot.routes.ts apps/api/src/routes/chatbot-v3.routes.ts apps/api/src/ws/patient-ws.ts apps/api/src/__tests__/chatbot.routes.test.ts apps/api/src/__tests__/chatbot-v3.mounting.test.ts
git -C /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 commit -m "feat(api): enforce site context for chatbot sessions"
```

## Chunk 2: Beauty Frontend Upgrade

### Task 4: Add Beauty’s production patient proxy and site-scoped auth client tests

**Files:**
- Create: `api/patient/[...path].js`
- Create: `test/BeautyPatientProxy.forwarding.test.ts`
- Modify: `services/crmApiClient.ts`
- Modify: `contexts/PatientAuthContext.tsx`
- Test: `test/PatientAuthContext.site-scope.test.tsx`
- Test: `test/BeautyPatientProxy.forwarding.test.ts`

- [ ] **Step 1: Write failing Beauty auth tests**

Cover:
- Beauty restore token storage stays Beauty-specific
- Beauty auth restores `/dashboard` correctly
- cross-site restore/session payloads are rejected or ignored
- the proxy preserves path, query string, request cookies, response status/body, and CRM `Set-Cookie` headers

```tsx
expect(localStorage.getItem('medora.patient.restoreToken')).toBe(null);
expect(localStorage.getItem('beauty.patient.restoreToken')).toBe('restore-token-beauty');
```

- [ ] **Step 2: Run the new Beauty auth and proxy tests**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty exec vitest run test/PatientAuthContext.site-scope.test.tsx test/BeautyPatientProxy.forwarding.test.ts
```

Expected: FAIL because the new proxy/site-scope contract is not implemented yet.

- [ ] **Step 3: Add the Beauty BFF route**

Create a Vercel-style catch-all proxy that forwards to CRM, injects the fixed site header, and preserves auth transport end to end:

```js
export default async function handler(req, res) {
  const upstream = `${process.env.CRM_API_BASE_URL}/${req.query.path.join('/')}${new URL(req.url, 'http://localhost').search}`;
  const upstreamRes = await fetch(upstream, {
    method: req.method,
    headers: { ...forwardedHeaders, 'x-medora-site': 'beauty' },
    body: req.method === 'GET' ? undefined : JSON.stringify(req.body),
  });
}
```

The route must forward the upstream response status, body, and `Set-Cookie` headers back to the browser unchanged.

- [ ] **Step 4: Align the Beauty CRM client**

Keep `services/crmApiClient.ts` pointed at `/api/patient` in production and keep the restore key Beauty-scoped. Remove assumptions that a China/legacy token can be reused.

- [ ] **Step 5: Align Beauty PatientAuthContext with the CRM-first contract**

Add the minimum missing behavior from China’s patient auth model:
- route bootstrap to `/dashboard`
- stable restore behavior
- query cleanup on logout
- no accidental reuse of another site’s recovery state

- [ ] **Step 6: Re-run the Beauty auth and proxy tests**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty exec vitest run test/PatientAuthContext.site-scope.test.tsx test/BeautyPatientProxy.forwarding.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git -C /Users/haowang/Desktop/medora-health-beauty add api/patient/[...path].js services/crmApiClient.ts contexts/PatientAuthContext.tsx test/PatientAuthContext.site-scope.test.tsx
git -C /Users/haowang/Desktop/medora-health-beauty commit -m "feat(beauty): add site-scoped patient proxy and auth restore flow"
```

### Task 5: Update Beauty header to `Login` / `Dashboard` + language behavior

**Files:**
- Modify: `components/Header.tsx`
- Modify: `components/LanguageSelector.tsx`
- Test: `test/Header.patient-auth.test.tsx`

- [ ] **Step 1: Write the failing header auth-control test**

Cover:
- anonymous header shows `Login`
- authenticated header shows `Dashboard`
- language selector remains visible next to auth controls

```tsx
expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
expect(screen.queryByRole('link', { name: /dashboard/i })).toBeNull();
```

- [ ] **Step 2: Run the header test to verify it fails**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty exec vitest run test/Header.patient-auth.test.tsx
```

Expected: FAIL because Beauty header still uses the old right-side behavior.

- [ ] **Step 3: Implement unified auth CTA logic in the Beauty header**

Mirror the China behavior semantically, not visually:

```tsx
const patientCta = isAuthenticated
  ? <Link to="/dashboard">Dashboard</Link>
  : <Link to="/login">Login</Link>;
```

- [ ] **Step 4: Adjust LanguageSelector layout only as needed**

Make the selector work beside the auth CTA without changing Beauty’s style system or menu taxonomy.

- [ ] **Step 5: Re-run the header test**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty exec vitest run test/Header.patient-auth.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git -C /Users/haowang/Desktop/medora-health-beauty add components/Header.tsx components/LanguageSelector.tsx test/Header.patient-auth.test.tsx
git -C /Users/haowang/Desktop/medora-health-beauty commit -m "feat(beauty): align header auth controls with patient dashboard flow"
```

### Task 6: Upgrade Beauty dashboard shell to China-equivalent IA

**Files:**
- Modify: `App.tsx`
- Modify: `pages/dashboard/DashboardLayout.tsx`
- Modify: `pages/dashboard/DashboardHome.tsx`
- Modify: `pages/dashboard/MessagesPage.tsx`
- Modify: `pages/dashboard/TicketsPage.tsx`
- Modify: `pages/dashboard/OrdersPage.tsx`
- Modify: `pages/dashboard/JourneyPage.tsx`
- Modify: `pages/dashboard/AiSummaryPage.tsx`
- Test: `test/BeautyDashboardRoutes.test.tsx`

- [ ] **Step 1: Write the failing dashboard-route shell test**

Cover that Beauty exposes the full top-level patient IA:
- `Home`
- `Quotes`
- `Messages`
- `Tickets`
- `Orders`
- `Journey`
- `AI Summary`

```tsx
expect(screen.getByRole('link', { name: /tickets/i })).toBeInTheDocument();
expect(screen.getByRole('link', { name: /ai summary/i })).toBeInTheDocument();
```

- [ ] **Step 2: Run the dashboard shell test**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty exec vitest run test/BeautyDashboardRoutes.test.tsx
```

Expected: FAIL if any China-level tabs or route wiring are missing.

- [ ] **Step 3: Align the top-level dashboard layout**

Update `DashboardLayout.tsx` and `App.tsx` so the route inventory and nav tabs match China’s patient dashboard scope while keeping Beauty colors/spacing.

- [ ] **Step 4: Normalize the page semantics**

Update the dashboard pages so they read existing CRM phase-2 hooks and behave like the China shell:
- action items on home
- messages as the conversation workspace
- tickets/orders/journey/AI summary as first-class tabs

- [ ] **Step 5: Re-run the dashboard shell test**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty exec vitest run test/BeautyDashboardRoutes.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git -C /Users/haowang/Desktop/medora-health-beauty add App.tsx pages/dashboard/DashboardLayout.tsx pages/dashboard/DashboardHome.tsx pages/dashboard/MessagesPage.tsx pages/dashboard/TicketsPage.tsx pages/dashboard/OrdersPage.tsx pages/dashboard/JourneyPage.tsx pages/dashboard/AiSummaryPage.tsx test/BeautyDashboardRoutes.test.tsx
git -C /Users/haowang/Desktop/medora-health-beauty commit -m "feat(beauty): align dashboard scope with china patient IA"
```

### Task 7: Replace Beauty’s widget with the CRM-first patient entry flow

**Files:**
- Modify: `components/ChatWidget.tsx`
- Modify: `components/chat/ChatWindow.tsx`
- Modify: `contexts/PatientEntryContext.tsx`
- Modify: `hooks/usePatientConversations.ts`
- Modify: `services/patientPhase2Api.ts`
- Test: `test/ChatWidget.crm-entry.test.tsx`

- [ ] **Step 1: Write the failing widget test**

Cover:
- unauthenticated state opens CRM-backed patient entry
- authenticated state opens conversation continuation
- dashboard messages and widget share the same conversation source

```tsx
expect(screen.getByText(/opening your messages/i)).toBeInTheDocument();
expect(mockGetConversations).toHaveBeenCalledTimes(1);
```

- [ ] **Step 2: Run the widget test**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty exec vitest run test/ChatWidget.crm-entry.test.tsx
```

Expected: FAIL because the old widget still owns an isolated onboarding window.

- [ ] **Step 3: Swap the widget shell to the CRM-first entry model**

Change `ChatWidget.tsx` and `ChatWindow.tsx` so they act like the China patient widget:
- anonymous: onboarding/patient entry
- authenticated: continue patient conversation

- [ ] **Step 4: Reconcile PatientEntryContext with CRM conversation truth**

Use `PatientEntryContext` as the UI state shell, but source truth from CRM-backed patient auth/conversation state instead of an isolated widget-only flow.

- [ ] **Step 5: Re-run the widget test**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty exec vitest run test/ChatWidget.crm-entry.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Run the full Beauty suite**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git -C /Users/haowang/Desktop/medora-health-beauty add components/ChatWidget.tsx components/chat/ChatWindow.tsx contexts/PatientEntryContext.tsx hooks/usePatientConversations.ts services/patientPhase2Api.ts test/ChatWidget.crm-entry.test.tsx
git -C /Users/haowang/Desktop/medora-health-beauty commit -m "feat(beauty): move patient widget to crm-first conversation flow"
```

## Chunk 3: China Compatibility and Cross-Site Verification

### Task 8: Make China’s site context explicit and keep current behavior passing

**Files:**
- Modify: `medical-china-comb/china-medical-journeys/src/services/api/crmApiClient.ts`
- Modify: `medical-china-comb/china-medical-journeys/src/contexts/PatientAuthContext.tsx`
- Test: `medical-china-comb/china-medical-journeys/src/services/api/__tests__/crmApiClient.restore-token.test.ts`
- Test: `medical-china-comb/china-medical-journeys/src/contexts/__tests__/PatientAuthContext.test.tsx`
- Test: `medical-china-comb/china-medical-journeys/src/services/api/__tests__/patient-chatbot.test.ts`
- Test: `medical-china-comb/china-medical-journeys/src/pages/__tests__/DashboardRoute.test.tsx`

- [ ] **Step 1: Add failing China client tests**

Cover that China injects the `china` site context explicitly and does not accept Beauty-scoped restore/session assumptions. Also cover that `medora.patient.restoreToken` is no longer auto-migrated into China storage.

```ts
expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/patient'), expect.objectContaining({
  headers: expect.objectContaining({ 'x-medora-site': 'china' }),
}));
expect(localStorage.getItem('medora.patient.restoreToken')).toBe(null);
expect(localStorage.getItem('china.patient.restoreToken')).toBe('restore-token-china');
```

- [ ] **Step 2: Run the focused China suites**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty/medical-china-comb/china-medical-journeys exec vitest run src/services/api/__tests__/crmApiClient.restore-token.test.ts src/services/api/__tests__/patient-chatbot.test.ts src/contexts/__tests__/PatientAuthContext.test.tsx src/pages/__tests__/DashboardRoute.test.tsx
```

Expected: FAIL on the new explicit site-context assertions.

- [ ] **Step 3: Make China’s CRM client inject `china` context**

Keep the existing transport strategy, but ensure every CRM request carries an explicit China site context. Remove the legacy Beauty restore-token migration branch or quarantine it behind an explicit one-time migration path so it cannot leak recovery state across brands.

- [ ] **Step 4: Adjust PatientAuthContext only if needed**

If CRM’s stricter site checks require bootstrap/restore changes, port the smallest safe change from Beauty/CRM contract updates.

- [ ] **Step 5: Re-run the focused China suites**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty/medical-china-comb/china-medical-journeys exec vitest run src/services/api/__tests__/crmApiClient.restore-token.test.ts src/services/api/__tests__/patient-chatbot.test.ts src/contexts/__tests__/PatientAuthContext.test.tsx src/pages/__tests__/DashboardRoute.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git -C /Users/haowang/Desktop/medora-health-beauty/medical-china-comb/china-medical-journeys add src/services/api/crmApiClient.ts src/contexts/PatientAuthContext.tsx src/services/api/__tests__/patient-chatbot.test.ts src/contexts/__tests__/PatientAuthContext.test.tsx src/pages/__tests__/DashboardRoute.test.tsx
git -C /Users/haowang/Desktop/medora-health-beauty/medical-china-comb/china-medical-journeys commit -m "fix(china): make patient crm calls site-context aware"
```

### Task 9: Run cross-project verification and document remaining rollout flags

**Files:**
- Modify: `docs/superpowers/specs/2026-04-16-beauty-china-crm-dashboard-chat-design.md`
- Create: `docs/superpowers/plans/2026-04-16-beauty-china-crm-dashboard-chat-rollout-notes.md`

- [ ] **Step 1: Run the three targeted verification commands**

Run:

```bash
pnpm --dir /Users/haowang/Desktop/medora-health-beauty/medical-crm-v2 --filter @medical-crm/api test -- src/__tests__/patient-public.routes.test.ts src/__tests__/patient-auth.routes.test.ts src/__tests__/patient-protected.routes.test.ts src/__tests__/chatbot.routes.test.ts src/__tests__/chatbot-v3.mounting.test.ts
pnpm --dir /Users/haowang/Desktop/medora-health-beauty test
pnpm --dir /Users/haowang/Desktop/medora-health-beauty/medical-china-comb/china-medical-journeys exec vitest run src/services/api/__tests__/crmApiClient.restore-token.test.ts src/services/api/__tests__/patient-chatbot.test.ts src/contexts/__tests__/PatientAuthContext.test.tsx src/pages/__tests__/DashboardRoute.test.tsx
```

Expected: All PASS.

- [ ] **Step 2: Smoke-check the manual cross-site rules**

Verify manually:
- Beauty login does not unlock China dashboard
- China login does not unlock Beauty dashboard
- Beauty chat sees Beauty FAQ/package/hospital content
- China chat sees China FAQ/package/hospital content

- [ ] **Step 3: Write rollout notes**

Capture:
- required env vars
- proxy target values
- brand/site header contract
- any migration/backfill needed for existing patient sessions

- [ ] **Step 4: Commit**

```bash
git -C /Users/haowang/Desktop/medora-health-beauty add docs/superpowers/specs/2026-04-16-beauty-china-crm-dashboard-chat-design.md docs/superpowers/plans/2026-04-16-beauty-china-crm-dashboard-chat-rollout-notes.md
git -C /Users/haowang/Desktop/medora-health-beauty commit -m "docs: add rollout notes for beauty china crm integration"
```
