# MCQ Assessment System

## What This Is
Claude retrieves validated assessment items via tool calls, presents them as interactive UI elements, and captures response data. Foundation for psychometrically-informed AI tutoring.

## Architecture
User <-> Chat UI <-> /api/chat <-> Claude (tools) <-> /lib/mcp/ (Item Bank)
                         |
                   /api/log-response -> data/responses.json

## Key Concepts

### MCP Tool Pattern
Claude calls `assessment_get_item(topic, difficulty)` to retrieve questions. Claude does NOT have questions memorized—it requests them. This enables validated item banks and enterprise customization.

### :::mcq Protocol
Claude wraps question JSON in :::mcq delimiters. The UI parses these and renders interactive components:

:::mcq
{"id":"...","stem":"...","options":[...],"correct":"...","feedback":{...}}
:::

### Response Logging
Every answer logs: {item_id, selected, correct, latency_ms, timestamp, session_id}

## Bash Commands
- npm run dev: Start dev server (port 3000)
- npm run build: Production build
- npm run lint: Run ESLint

## Code Style
- ES modules (import/export), never CommonJS
- Zod for ALL schema validation
- Explicit TypeScript types, minimal any
- Destructure imports: import { z } from 'zod'

## File Purposes
| Path | Purpose |
|------|---------|
| /lib/mcp/schemas/item.ts | Zod schemas for items and tool inputs |
| /lib/mcp/item-bank.json | Curated frontend engineering questions |
| /lib/mcp/tools/get-item.ts | assessment_get_item tool function |
| /lib/mcp/tools/list-topics.ts | assessment_list_topics tool function |
| /lib/mcp/tools/index.ts | Tool registry and executor |
| /lib/parse-mcq.ts | Extracts :::mcq blocks from Claude responses |
| /components/MCQCard.tsx | Interactive question renderer |
| /app/api/chat/route.ts | Claude API + tool execution loop |
| /app/api/log-response/route.ts | Appends responses to JSON file |
| /app/page.tsx | Chat UI |
| /data/responses.json | Accumulated response data |

## Implementation Rules
1. ALWAYS validate with Zod before using data
2. Tool functions return null for invalid queries, never throw
3. MCQCard captures latency_ms from render time to click
4. Chat UI sends response context back to Claude after MCQ interaction
5. Items MUST have plausible distractors and code snippets where relevant

## Testing Approach
- Test tool functions directly before integration
- Use curl to test /api/chat before building UI
- Full flow test: greeting -> assessment -> feedback -> continuation

## Topics for Item Bank
js-this, js-closures, js-async, js-prototypes, js-timers, js-patterns, html-events

Each topic needs 2-3 items at varying difficulty levels (easy, medium, hard).
