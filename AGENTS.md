# AGENTS.md

This file guides AI coding agents working in this repository. Follow it unless a more specific `AGENTS.md` is present in a subdirectory.

For detailed reference, use:

- [Agent Reference](docs/agent-reference.md) for project overview, commands, layout, environment, build notes, feature workflow, and known pitfalls.
- [Agent Skill Strategy](docs/agent-skill-strategy.md) for UI/UX, shadcn, AI Elements, frontend performance, browser verification, and presentation-skill usage.

## Core Rules

- Use `pnpm`; the repository declares `packageManager: pnpm@10.32.1`.
- Preserve Chinese product copy and patent-domain terminology unless the task explicitly asks for another language.
- Use the `@/*` path alias for repository-root imports.
- Check `git status` before and after editing.
- Do not overwrite user changes or unrelated local modifications.
- Keep changes scoped to the requested behavior.
- Do not reformat the entire repository unless explicitly asked.
- Do not edit generated files such as `.next/` or `tsconfig.tsbuildinfo`.
- Avoid changing lockfiles unless dependencies actually changed.

## Coding Conventions

- Prefer TypeScript and React Server Components by default. Add `"use client"` only when a component uses state, effects, browser APIs, event handlers, or client-only libraries.
- Keep route handlers thin. Put reusable or complex logic in `service.ts` or `lib/service`.
- Validate request input at API boundaries. The repo already depends on `zod`; prefer it for non-trivial payloads.
- Return JSON errors with useful messages and appropriate HTTP status codes.
- Use `console.error` for server-side operational errors only when it helps debugging. Do not log secrets, model prompts containing private user data unnecessarily, or signed URLs beyond what is needed.
- Keep comments short and useful. Existing code uses a mix of Chinese comments and self-explanatory names; match the nearby style.
- Do not introduce broad abstractions unless they remove real duplication or match an existing local pattern.

## UI And Styling

- Reuse `components/ui` primitives before creating new controls.
- Use `lucide-react` icons for icon buttons and common actions.
- Use `cn` from `@/lib/utils` for conditional class composition.
- Keep workflow UI task-focused and consistent with the existing app shell: sidebar plus full-height workflow panels.
- Avoid placing business workflow state inside `components/ui`.
- When adding generated or exported document features, prefer existing templates in `public/` if they match the workflow.
- For UI/UX work, consult [Agent Skill Strategy](docs/agent-skill-strategy.md) and combine the relevant UI, performance, and browser-verification skills.
- For AI chat UI work, keep the local v0 conversation components as the baseline unless the task explicitly asks to migrate component source or align with the current Vercel AI Elements stack.

## Verification Expectations

Before handing off a meaningful code change:

- Run `pnpm lint` when relevant to edited files.
- Run `pnpm build` for changes that affect routing, server/client component boundaries, exports, or deployment behavior.
- Manually exercise the relevant `app/test/...` page or API route when there is no automated test coverage.
- If a command cannot be run because of missing secrets or external services, state that clearly and describe the closest verification performed.

## AI And Environment Safety

- Use environment variables for model and service configuration. See [Agent Reference](docs/agent-reference.md) for the current environment variable families.
- Never commit real secrets from `.env`, API keys, OSS credentials, database passwords, or signed URLs.
- Preserve existing OpenAI-compatible LangChain patterns and Langfuse callback wiring where present.
