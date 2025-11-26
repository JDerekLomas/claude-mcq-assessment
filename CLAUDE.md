# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **React**: Version 19 with React Compiler enabled
- **Styling**: Tailwind CSS v4 with shadcn/ui (new-york style)
- **Database**: better-sqlite3
- **AI**: @anthropic-ai/sdk
- **Validation**: Zod

## Architecture

- Uses Next.js App Router (`src/app/`)
- Path alias: `@/*` maps to `./src/*`
- shadcn/ui components go in `@/components/ui`, utilities in `@/lib/utils`
- CSS variables defined in `src/app/globals.css` for theming (light/dark mode)
- Geist font family (sans and mono) configured via next/font
