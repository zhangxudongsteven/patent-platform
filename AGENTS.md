# AGENTS.md

This file guides AI coding agents working in this repository. Follow it unless a more specific `AGENTS.md` is present in a subdirectory.

## Project Overview

This is a patent workflow platform built with Next.js App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui-style Radix components, LangChain/OpenAI-compatible model calls, Langfuse tracing, PostgreSQL, and S3-compatible OSS storage.

The product surface is primarily Chinese-language patent assistance:

- Patent Q&A chat
- Patent search keyword and formula workflows
- Patent disclosure workflows
- Patent report workflows
- Patent analysis workflows
- Test pages under `app/test` for exercising individual API/service flows

## Tech Stack And Package Manager

- Use `pnpm`; the repository declares `packageManager: pnpm@10.32.1`.
- Runtime framework: Next.js 16 with App Router and React 19.
- TypeScript is strict in `tsconfig.json`.
- UI components live in `components/ui` and follow the shadcn `new-york` style configured in `components.json`.
- Use the `@/*` path alias for repository-root imports.

## Common Commands

Run commands from the repository root:

- `pnpm dev` - start the local Next.js development server.
- `pnpm build` - build the standalone Next.js app.
- `pnpm lint` - run ESLint across the repo.
- `pnpm format` - run Prettier over the repo.

There is no dedicated test script at the time of writing. For behavior checks, use focused manual verification through the matching `app/test/...` page or API route, and document what was verified.

## Repository Layout

- `app/` - Next.js routes, layouts, pages, and API handlers.
- `app/api/**/route.ts` - API route entrypoints. Keep HTTP parsing, validation, response shaping, and status codes here.
- `app/api/**/service.ts` - route-local business logic, model orchestration, document generation, or external service calls.
- `app/test/` - manual test and diagnostic pages for individual workflows/services.
- `components/` - reusable React components for the main app shell and workflows.
- `components/workflows/` - patent-specific workflow UI and client-side orchestration.
- `components/ui/` - shared UI primitives. Treat these as design-system components and avoid business logic here.
- `hooks/` - reusable React hooks.
- `lib/` - shared types, utilities, and service clients/actions.
- `lib/service/` - shared service integrations, such as chat, embeddings, IPC, OSS/S3, and storage clients.
- `public/` - static assets and Word templates used by export flows.
- `instrumentation.ts` and `instrumentation.node.ts` - runtime instrumentation hooks.

## Coding Conventions

- Prefer TypeScript and React Server Components by default. Add `"use client"` only when a component uses state, effects, browser APIs, event handlers, or client-only libraries.
- Keep route handlers thin. Put reusable or complex logic in `service.ts` or `lib/service`.
- Validate request input at API boundaries. The repo already depends on `zod`; prefer it for non-trivial payloads.
- Return JSON errors with useful messages and appropriate HTTP status codes.
- Preserve Chinese product copy and patent-domain terminology unless the task explicitly asks for another language.
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

## AI, LangChain, And Observability

- Model configuration should come from environment variables, especially `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_CHAT_MODEL`, `OPENAI_EMBEDDING_MODEL`, and `OPENAI_VISION_MODEL`.
- Use OpenAI-compatible clients through the existing LangChain/OpenAI patterns unless a task requires a different provider.
- Preserve Langfuse callback wiring where present. If adding new model chains, consider whether they should include `CallbackHandler` for traceability.
- For JSON model outputs, use a structured parser and prompt for strict JSON. Handle parser failures clearly.
- Keep timeouts and retry behavior explicit for long model calls.

## Environment And Secrets

- Use `.env.example` as the reference for required variables.
- Never commit real secrets from `.env`, API keys, OSS credentials, database passwords, or signed URLs.
- The `.env.example` file may contain placeholder or masked values; keep new examples masked and non-sensitive.
- OSS/S3-compatible storage is configured through `OSS_ENDPOINT`, `OSS_BUCKET`, `OSS_ACCESS_KEY`, and `OSS_SECRET_KEY`.
- PostgreSQL is configured through `POSTGRES_*` variables.

## Build And Deployment Notes

- `next.config.mjs` currently sets `output: "standalone"` for Docker deployment.
- `next.config.mjs` also sets `typescript.ignoreBuildErrors: true`. Do not treat a successful `pnpm build` as proof that types are clean; run additional checks when touching typed contracts.
- `images.unoptimized: true` is enabled, so avoid relying on Next image optimization behavior.
- The Dockerfile builds with Node 20 Alpine and supports pnpm through Corepack.
- The GitHub Actions workflow is manually triggered and builds/pushes a Docker image.

## Verification Expectations

Before handing off a meaningful code change:

- Run `pnpm lint` when relevant to edited files.
- Run `pnpm build` for changes that affect routing, server/client component boundaries, exports, or deployment behavior.
- Manually exercise the relevant `app/test/...` page or API route when there is no automated test coverage.
- If a command cannot be run because of missing secrets or external services, state that clearly and describe the closest verification performed.

## Change Safety

- Check `git status` before and after editing.
- Do not overwrite user changes or unrelated local modifications.
- Keep changes scoped to the requested behavior.
- Do not reformat the entire repository unless explicitly asked.
- Do not edit generated files such as `.next/` or `tsconfig.tsbuildinfo`.
- Avoid changing lockfiles unless dependencies actually changed.

## Adding New Features

When adding a new patent workflow or AI-backed endpoint:

1. Add the route under `app/api/<domain>/<feature>/route.ts`.
2. Put model/business logic in a colocated `service.ts` if it is route-specific, or `lib/service` if shared.
3. Add or update workflow UI under `components/workflows`.
4. Add a focused manual test page under `app/test/<domain>/<feature>/page.tsx` when no automated test exists.
5. Document required environment variables in `.env.example`.
6. Verify with `pnpm lint`, and run `pnpm build` when the change affects app structure or deployment.

## Known Pitfalls

- Several services call external AI, database, or OSS systems. Local verification may require a populated `.env`.
- API routes often support both `GET` and `POST`; keep their validation and response shapes consistent.
- Server Actions and streaming responses must remain serializable across the Next.js boundary.
- Word template export flows depend on files in `public/`; keep file names stable unless all callers are updated.
- `components/ui` is shared widely. Small visual changes there can affect many screens.
