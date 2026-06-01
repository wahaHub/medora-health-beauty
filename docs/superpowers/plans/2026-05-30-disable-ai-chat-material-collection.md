# Disable AI Chat Material Collection Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the patient-facing AI chat widget with a deterministic consent and medical-material collection flow.

**Architecture:** Keep the existing floating widget, onboarding bootstrap, CRM session, and attachment upload APIs. Replace the post-profile chatbot/hospital-selection surface with a localized fixed panel that asks for rules consent, lists useful materials, and sends text/files through the existing CRM conversation `MessageInput`.

**Tech Stack:** React, Vite, Vitest, existing `usePatientEntry`, `usePatientConversations`, `useLanguage`, and `MessageInput`.

---

### Task 1: Deterministic Material Collection Panel

**Files:**
- Modify: `components/chat/OnboardingFlow.tsx`
- Test: `test/OnboardingFlow.material-collection.test.tsx`

- [ ] Write tests proving the panel is localized, hides upload until consent, and mounts the CRM-backed `MessageInput` after consent.
- [ ] Implement a small localized copy map keyed by the current site language.
- [ ] In backend-owned post-onboarding mode, show submitted details plus the fixed rules/material collection panel.
- [ ] Resolve the current case conversation from `usePatientConversations`; pass the conversation id to `MessageInput` so all text and attachments go to CRM v2.
- [ ] Run focused tests and build.
