# Beauty / China CRM-First Dashboard & Chat Design

**Date**: 2026-04-16
**Repos in scope**:
- `medora-health-beauty`
- `medical-china-comb/china-medical-journeys`
- `medical-crm-v2`

## Overview

This design brings the Medora Beauty patient experience up to the same functional level as China Medical Journeys for patient dashboard and chat, while keeping all three deployments independent.

The key architectural decision is:

- `medical-crm-v2` becomes the authoritative backend for shared patient chat and dashboard contracts.
- `medora-health-beauty` and `china-medical-journeys` remain separate frontend shells with their own branding, routing, and deployment pipelines.
- `beauty` and `china` patient identities stay isolated from each other, even when both use the same CRM chatbot engine.

## Confirmed Product Decisions

### 1. Reuse model

Use a `CRM-first` model.

- Do **not** move the frontend chat UI into CRM.
- Do **not** require one shared React package before shipping.
- Share backend contracts, orchestration, and brand-aware routing through CRM.

### 2. Dashboard scope

Beauty dashboard should align with China's patient dashboard scope:

- `Home`
- `Quotes`
- `Messages`
- `Tickets`
- `Orders`
- `Journey`
- `AI Summary`

Beauty can keep its own visual style and route implementation, but the information architecture and feature coverage should match China.

### 3. Patient identity model

Beauty and China patient identity must remain independent.

- A patient session created on `beauty` is not reused on `china`.
- A patient session created on `china` is not reused on `beauty`.
- Both frontends can still use the same CRM chatbot backend logic.

### 4. Brand context model

The chatbot engine is shared, but brand context is not.

CRM must route by site/brand context so each frontend gets its own:

- FAQ corpus
- hospital pool / matching logic
- package set
- copy and recommendation wording
- downstream patient dashboard data scope

### 5. Navigation scope for Beauty

Beauty should **not** copy China's full navigation structure.

Only align the right-side auth/language behavior:

- show `Login` when unauthenticated
- show `Dashboard` when authenticated
- keep language selection adjacent to auth controls

Beauty should retain its existing marketing navigation and UI style.

## Approaches Considered

### Option A: CRM-hosted embedded patient app

Embed one CRM-owned patient frontend into both sites.

Pros:
- maximum frontend reuse
- one place to change chat/dashboard UI

Cons:
- tightly couples frontend releases to CRM deployment
- weak fit for brand-specific routing, page chrome, and site ownership
- introduces more risk to both sites at once

### Option B: Shared frontend package

Extract chat/dashboard UI into a shared package consumed by both sites.

Pros:
- more frontend reuse than today
- separate deployments still possible

Cons:
- early abstraction cost is high
- current site shells are not close enough to justify package-first work
- likely to slow delivery of Beauty

### Option C: CRM-authoritative backend + site-owned frontend shells

Keep frontends site-owned and move shared logic into CRM contracts.

Pros:
- matches the current deployment model
- lowest migration risk
- lets Beauty align with China quickly without forcing identical UI
- creates a stable long-term backend boundary

Cons:
- some frontend duplication remains

### Recommendation

Choose **Option C**.

Shared logic should live in:

- CRM session/auth contracts
- chatbot endpoints and orchestration
- brand-aware data routing
- dashboard data contracts

Site-specific logic should live in:

- marketing navigation
- layout chrome
- component styling
- route composition

## Target Architecture

### Layer 1: `medical-crm-v2`

CRM becomes the system of record for:

- patient session bootstrap and restore
- magic-link / password login flows
- chatbot history, send, uploads, and orchestration
- patient dashboard data
- brand-aware routing for chatbot and dashboard queries

CRM should explicitly support a `site context` such as:

- `china`
- `beauty`

This context must influence both chatbot and dashboard reads/writes.

### Layer 2: `china-medical-journeys`

China remains a separate frontend shell.

- Keep current patient widget and dashboard structure.
- Harden it around explicit site context injection to CRM.
- Continue using CRM-owned contracts as the source of truth.

China is the functional reference for Beauty, but not the visual template.

### Layer 3: `medora-health-beauty`

Beauty becomes a second patient frontend shell backed by the same CRM contracts.

- Replace or upgrade its current patient chat entry to the CRM-first model.
- Upgrade dashboard coverage to match China.
- Keep Beauty-specific branding and navigation.

## Beauty Frontend Design

### 1. Navigation

Update Beauty's header behavior, not its visual language.

Current Beauty header already has its own structure and styling. Preserve that. Only change the auth controls so they behave like China:

- unauthenticated: `Login`
- authenticated: `Dashboard`
- language selector displayed next to auth controls

This should be implemented in Beauty's existing header instead of importing China's header/top-bar components.

### 2. Dashboard shell

Beauty already has dashboard routes and pages. Do not rebuild from zero. Upgrade the existing shell so the route inventory matches China:

- `/dashboard`
- `/dashboard/quotes`
- `/dashboard/messages`
- `/dashboard/tickets`
- `/dashboard/orders`
- `/dashboard/journey`
- `/dashboard/ai-summary`

Supporting nested or utility routes may remain Beauty-specific, but top-level patient navigation should align with China.

### 3. Dashboard data behavior

Beauty dashboard pages should consume CRM data with the same semantic meanings as China:

- action items on home
- quotes list and accept/reject flows
- messages view backed by the same patient conversation model
- ticket, order, journey, and AI summary states using CRM contracts

Beauty can render these with its own components and styling, but should avoid inventing a second data model.

### 4. Chat widget behavior

Beauty's existing floating chat widget should be replaced or upgraded to the China-style patient entry model:

- unauthenticated state: onboarding and patient entry
- authenticated state: continue the patient conversation
- dashboard state: same conversation system, not a separate messaging stack

The important rule is that chat widget and dashboard messages must read from the same CRM conversation/session foundation.

### 5. Patient auth behavior

Beauty should keep its own auth shell and routes, but the contract should align with China's patient auth model:

- magic link
- password login
- restore token/session recovery
- dashboard entry and protected routes

Because Beauty and China are isolated patient identities, their session persistence must remain site-scoped.

## CRM Brand-Aware Contract

### 1. Site context as a first-class input

CRM should treat `site context` as a first-class routing input for all patient-facing operations in this project.

Recommended values:

- `china`
- `beauty`

### 2. Session isolation

Patient sessions must be bound to site context.

This means:

- restore tokens are site-scoped
- magic link verification is site-scoped
- `/me` and dashboard bootstrap resolve within the current site context
- patient records and active cases are not accidentally reused across brands

Same email across both sites must not imply a shared patient session.

### 3. Chatbot routing

Chatbot requests from both sites should use the same CRM engine and public contract, but CRM must route by site context to select the correct:

- FAQ corpus
- package catalog context
- hospital pool / matching strategy
- wording/copy policy
- resource recommendations

This preserves one chatbot backend while allowing different brand behavior.

### 4. Dashboard routing

Dashboard data endpoints must also resolve through site context so CRM only returns data belonging to the current brand space:

- cases
- conversations
- quotes
- tickets
- orders
- journey state
- AI summary data

This avoids cross-brand reads and makes frontend behavior predictable.

### 5. Transport strategy

Do not rely on frontend components manually threading brand values through every call.

Recommended transport:

- each site calls its own BFF/proxy layer
- the BFF injects a fixed site header or internal field
- CRM reads that field and routes accordingly

Example:

- `x-medora-site: beauty`
- `x-medora-site: china`

This keeps brand context stable and prevents accidental misuse.

## Implementation Direction

### Phase 1: Stabilize CRM contract

In `medical-crm-v2`:

- verify current chatbot endpoints already support brand-aware behavior end to end
- add or harden explicit site context routing where missing
- ensure patient auth/session flows are site-isolated
- confirm dashboard endpoints are also site-aware

If any route currently assumes a single patient brand space, fix CRM first before porting frontend behavior.

### Phase 2: Upgrade Beauty auth/navigation shell

In `medora-health-beauty`:

- update header auth controls to `Login` / `Dashboard`
- place language selector next to auth controls
- align protected dashboard entry behavior with the patient auth session model

This gives users the correct top-level path before the full dashboard/chat migration lands.

### Phase 3: Port Beauty dashboard to China-equivalent scope

In `medora-health-beauty`:

- upgrade existing dashboard layout and tabs to match China scope
- connect pages to CRM-backed contracts
- normalize empty states, action items, and CTA behavior around the CRM data model

The goal is feature parity of patient IA, not pixel parity.

### Phase 4: Replace Beauty chat entry with CRM-first patient widget

In `medora-health-beauty`:

- retire old chat widget behavior
- mount the new patient-entry/chat flow against CRM
- ensure authenticated widget state and dashboard messages converge on the same conversation source

### Phase 5: Verify China compatibility

In `china-medical-journeys`:

- update any site-context injection needed to fit the final CRM contract
- regression-test dashboard and chat against the same CRM changes

Beauty should not ship by silently breaking China.

## Data and Boundary Rules

### Shared across sites

- CRM chatbot engine
- CRM patient dashboard contract
- CRM upload and conversation semantics
- orchestration/state meanings

### Not shared across sites

- patient identity/session
- frontend routes
- frontend component code
- site styling
- marketing navigation/content

## Error Handling

The system should handle the following explicitly:

- missing or invalid site context: fail closed, not open
- expired patient restore token: require re-authentication in the current site
- dashboard data request with mismatched session/site: reject and clear recovery state as needed
- chatbot request routed to wrong brand context: log as a contract violation and reject rather than silently fallback

## Testing Strategy

### CRM tests

- site-aware auth/session tests
- site-aware chatbot routing tests
- site-aware dashboard query tests
- regression coverage for China routes and current chatbot behavior

### Beauty tests

- header auth state switches from `Login` to `Dashboard`
- language selector remains present and functional
- protected dashboard routing works with patient session restore
- chat widget and dashboard messages show the same underlying conversation state

### Cross-project verification

- Beauty chat does not show China FAQ/package/hospital context
- China chat does not show Beauty FAQ/package/hospital context
- same email used on both sites does not create a shared patient session

## Risks

### 1. Hidden single-brand assumptions in CRM

Current CRM chatbot behavior may already support multiple contexts conceptually, but hidden assumptions in auth, restore, or dashboard queries could still leak across brands.

### 2. Beauty's legacy chat and dashboard code

Beauty already has an older patient stack. Partial reuse is useful, but mixing old and new semantics without a clean contract pass could create duplicate state or confusing UX.

### 3. Silent brand drift

If site context is optional or weakly enforced, Beauty may accidentally reuse China copy or matching behavior. This should be treated as a correctness bug, not a cosmetic issue.

## Non-Goals

- full visual unification between Beauty and China
- a single shared frontend package in this phase
- shared cross-site patient login/session
- moving all patient UI into CRM deployment

## Final Recommendation

Ship this as a **CRM-first, brand-aware backend integration** with **site-owned frontend shells**.

That gives Medora:

- one shared chatbot backend logic layer
- independent Beauty and China patient identities
- China-level dashboard capability for Beauty
- minimal disruption to each site's branding and deployment model
