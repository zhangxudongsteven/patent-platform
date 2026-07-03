# Agent Skill Strategy

Use this document with `AGENTS.md` when a task touches UI, UX, AI chat interfaces, frontend performance, browser verification, or generated visual artifacts.

## Skill Sources

- Treat both Codex global skills in `~/.codex/skills` and shared agent skills in `~/.agents/skills` as available guidance when they are surfaced in the current session.
- Prefer task-specific skills only when they materially improve the work. Do not invoke visual or testing workflows for unrelated backend-only changes.
- `ai-elements` is installed from the official Vercel AI Elements skill and lives in `~/.agents/skills/ai-elements`; restart Codex if a future session does not surface it automatically.

## UI And UX Work

- Combine `shadcn`, `web-design-guidelines`, and `frontend-design`.
- Use `shadcn` for component composition, registry-aware implementation, installed primitive checks, and shadcn/ui usage conventions.
- Use `web-design-guidelines` for accessibility, focus states, forms, button semantics, long text, empty states, and interaction audits.
- Use `frontend-design` when creating or reshaping UI that needs visual direction, typography choices, layout hierarchy, or a less generic product feel.

## Design Systems

- Use `tailwind-design-system` for Tailwind CSS v4 tokens, responsive patterns, shared component styling, theme work, and design-system standardization.
- Keep routine product UI aligned with the existing app shell unless the task explicitly asks for a broader visual redesign.

## React And Next.js Performance

- Use `vercel-react-best-practices` for React/Next.js UI performance concerns.
- Apply it especially to client/server boundaries, streaming or data fetching, re-render behavior, long lists, input responsiveness, and bundle size.

## AI Chat Interfaces

- Use `ai-elements` when building or refactoring AI-native chat UI with Vercel's current recommended component stack.
- Prefer AI Elements for new or explicitly migrated chat surfaces that need `Conversation`, `Message`, `PromptInput`, attachments, sources, reasoning, tool displays, or AI SDK `message.parts` rendering.
- Pair `ai-elements` with `shadcn` because AI Elements installs source components into the project and follows shadcn/ui conventions.
- Pair `ai-elements` with `vercel-react-best-practices` when changing `useChat`, streaming updates, status handling, abort/regenerate behavior, or long conversation rendering.

## Browser Verification

- Use `webapp-testing` for local smoke tests, screenshots, DOM inspection, and browser-level verification.
- Use `playwright-best-practices` when creating, debugging, or hardening Playwright coverage.
- Use `playwright-cli` for quick browser interaction when a lightweight manual automation loop is enough.

## Presentation-Style Visual Artifacts

- Use `guizang-ppt-skill` only for web PPTs, presentation experiences, launch/demo decks, or explicitly requested magazine/Swiss-style HTML slides.
- Do not apply it to routine product UI unless the task is explicitly a presentation-style artifact.

## AI Chat UI Baseline

- For AI chat UI work in this repository, keep the local v0 conversation components as the baseline unless the task explicitly asks for a different component source.
- Use the skills above to improve implementation quality, accessibility, performance, and verification without changing backend contracts.
- If the task asks to align with the latest Vercel recommendation, evaluate a staged migration to AI SDK `useChat` plus AI Elements `Conversation` / `Message` / `PromptInput`, while preserving patent workflow handoff contracts such as tool selection and uploaded-file routing.
