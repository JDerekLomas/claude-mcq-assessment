# MCQMCP Integration Guide

MCQMCP provides validated MCQ assessments via MCP tools. This guide covers integration with your Claude interface.

## How It Works

1. User asks Claude to quiz them on a topic
2. Claude calls `assessment_get_item` to fetch a validated question
3. Claude returns the item in `:::mcq` format
4. Your UI parses and renders an interactive MCQ card
5. User answers; your UI calls `assessment_log_response`
6. Response data enables progress tracking and psychometrics

## MCP Tools

### `assessment_get_item`
Fetch a question from the item bank.

```typescript
{ topic: string, difficulty?: "easy" | "medium" | "hard" }
```

### `assessment_list_topics`
List available topics.

### `assessment_log_response`
Record a user's answer.

```typescript
{
  item_id: string,
  selected: string,      // "A", "B", "C", "D"
  correct: boolean,
  latency_ms: number,
  user_id: string,
  session_id?: string
}
```

## MCQ Protocol

Claude wraps questions in `:::mcq` delimiters:

```
:::mcq
{
  "id": "js-closures-1",
  "stem": "What will this code output?",
  "code": "for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 0); }",
  "options": [
    {"key": "A", "text": "0, 1, 2"},
    {"key": "B", "text": "3, 3, 3"},
    {"key": "C", "text": "undefined, undefined, undefined"},
    {"key": "D", "text": "ReferenceError"}
  ],
  "correct": "B",
  "feedback": {
    "correct": "Right! var is function-scoped...",
    "incorrect": "Remember that var is function-scoped..."
  }
}
:::
```

Parse these blocks and render an interactive card.

## Integration Steps

### 1. Parse MCQ blocks

```typescript
function parseMCQBlocks(content: string) {
  const regex = /:::mcq\n([\s\S]*?)\n:::/g;
  const blocks = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    blocks.push(JSON.parse(match[1]));
  }
  return blocks;
}
```

### 2. Build an MCQ card component

- Display stem and code (if any)
- Show clickable options
- Track time from render to click (`latency_ms`)
- Reveal feedback after selection

### 3. Log responses

After user answers, call `assessment_log_response` with the result.

## Authentication

```
Authorization: Bearer <api_key>
X-User-ID: <user_identifier>
```

Your app handles user auth. MCQMCP just needs a consistent user ID to track progress.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

## Data Captured

**Per response:**
- Item ID, selected option, correctness
- Response latency (ms)
- Timestamp, session ID, user ID

**Analytics enabled:**
- Difficulty index (% correct)
- Discrimination index
- Distractor analysis
- Learning curves per user
- Topic mastery over time

## Tech Stack

- Next.js 16 + React 19
- Tailwind CSS + shadcn/ui
- better-sqlite3
- @anthropic-ai/sdk
- Zod
