# Agent Reference

This document holds repository reference material for AI coding agents. Keep immediate operating rules in `AGENTS.md`; use this file for details that agents should consult when the task touches the relevant area.

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
