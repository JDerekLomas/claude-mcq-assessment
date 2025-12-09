# MCQMCP

**Measurement infrastructure for AI-assisted learning.**

MCQMCP is an MCP server that provides validated assessments to any Claude interface. Instead of AI generating quiz questions (which may have wrong answers), Claude requests curated items from MCQMCP and logs learner responses.

## The Problem

When you ask Claude to quiz you:
- AI-generated questions can have wrong answers
- No progress tracking across sessions
- No validation that questions measure what they claim

## The Solution

```
Your Claude UI ──→ Claude ──→ MCQMCP
                              │
                    ┌─────────┴─────────┐
                    │ • Validated items │
                    │ • Response logging│
                    │ • Progress tracking│
                    └───────────────────┘
```

Claude calls MCP tools to fetch questions and log answers. Your UI renders them. MCQMCP captures everything needed to measure learning.

## Quick Start

```bash
cd claude-mcq-assessment
npm install
npm run dev
```

Visit http://localhost:3000

## Documentation

- **[README](claude-mcq-assessment/README.md)** — Integration guide
- **[VISION](claude-mcq-assessment/VISION.md)** — Why this exists
- **[ROADMAP](claude-mcq-assessment/ROADMAP.md)** — What we're building
- **[RESEARCH](claude-mcq-assessment/RESEARCH.md)** — Open questions

## License

MIT
