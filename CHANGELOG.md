# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [未发布]

## [0.1.1] - 2026-07-03

### 变更

- 恢复首页 Vercel v0 对话组件实现，并通过共享消息组件保持 QA 测试页消息展示一致性。
- 优化专利交底书和专利检索报告工作流的 shadcn/ui 组件组合，减少自定义状态样式。

### Chore

- 升级 Next.js、Radix UI、lucide-react 等前端依赖。
- 升级 GitHub Actions CI 工作流中 Docker 相关 Action 至最新大版本（checkout v5、buildx v4、login v4、metadata v6、build-push v7）

## [0.1.0] - 2025-05-27

### 新增

- 支持 Docker 部署，新增多阶段构建的 `Dockerfile` 和 `.dockerignore`
- 新增 GitHub Actions CI 工作流，支持手动触发构建并将 Docker 镜像推送到 GHCR
- 启用 Next.js standalone 输出模式，以适配容器化部署

### 变更

- 在 `package.json` 中新增 `packageManager` 字段

### 修复

- 补充 `@types/adm-zip` 类型声明，修复 TypeScript 类型检查报错
