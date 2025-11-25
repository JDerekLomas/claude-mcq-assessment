Build Phase $ARGUMENTS of the MCQ Assessment System.

Reference CLAUDE.md for architecture and file purposes.

Steps:
1. Read any existing related files first
2. Create/update the files for this phase
3. Validate everything works (run tests or manual verification)
4. Report what was built and any issues found

Phase guide:
- Phase 1: Item Bank (/lib/mcp/ — schemas, item-bank.json, tools)
- Phase 2: Claude Integration (/app/api/chat/ — tool definitions, execution loop)
- Phase 3: MCQ Renderer (/lib/parse-mcq.ts, /components/MCQCard.tsx)
- Phase 4: Chat UI (/app/page.tsx, /app/api/log-response/)

Commit when phase is complete and verified.
