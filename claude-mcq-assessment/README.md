# MCQMCP

An MCP server that brings validated assessments to AI chat interfaces. Instead of AI generating quiz questions (which may be inaccurate or poorly calibrated), MCQMCP provides curated item banks that Claude can access via tool calls.

**[Read the full vision →](VISION.md)** | **[R&D Roadmap →](ROADMAP.md)** | **[Research Agenda →](RESEARCH.md)**

## Why This Exists

When learning through AI chat, you might ask Claude to quiz you. But there's a problem:

- **AI-generated questions** can have wrong answers, poor distractors, or inconsistent difficulty
- **No progress tracking** across sessions - your learning history is lost
- **No validation** - questions aren't tested for educational effectiveness

MCQMCP solves this by separating concerns:

- **Item banks** contain validated, curated questions with calibrated difficulty
- **Claude requests questions** via MCP tools rather than generating them
- **Responses are logged** for progress tracking and learning analytics
- **Any Claude interface** can integrate - it's not tied to one UI

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   claudetabs    │     │  your clone     │
│   (or any UI)   │     │                 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     ▼
              ┌─────────────┐
              │   Claude    │
              └──────┬──────┘
                     │ MCP Protocol (HTTP)
                     ▼
         ┌───────────────────────┐
         │        MCQMCP         │
         │                       │
         │  Tools:               │
         │  • assessment_get_item│
         │  • assessment_list_   │
         │    topics             │
         │  • assessment_log_    │
         │    response           │
         │                       │
         │  Storage:             │
         │  • Item banks         │
         │  • Response logs      │
         │  • User progress      │
         └───────────────────────┘
```

## How It Works

### For Learners

1. Chat with Claude in your favorite interface (claudetabs, etc.)
2. Ask to practice a topic: "Quiz me on JavaScript closures"
3. Claude fetches a validated question from MCQMCP
4. Question renders as an interactive card in chat
5. You answer, get instant feedback
6. Your progress is tracked across sessions

### For Clone Developers

1. Get an API key from MCQMCP
2. Connect your Claude integration to the MCP server
3. Implement `:::mcq` block parsing in your UI
4. Build an MCQ card component matching your design
5. Pass user identifiers so progress persists

### For Learning Engineers

MCQMCP captures the data you need to measure learning:

**Response-level data:**
- Item ID, selected option, correctness
- Response latency (time from question render to answer)
- Session and user identifiers
- Timestamp

**Item analytics:**
- Difficulty index (% correct)
- Discrimination index (how well items differentiate learners)
- Distractor analysis (which wrong answers are chosen)
- Response time distributions

**Learner analytics:**
- Topic mastery over time
- Learning curves
- Knowledge gaps
- Session patterns

**What this enables:**
- Validate item quality with real response data
- Identify poorly-calibrated questions
- Measure knowledge retention across sessions
- A/B test instructional approaches
- Build adaptive item selection (serve harder items as learners improve)

## MCP Tools

### `assessment_get_item`

Fetches a question from an item bank.

```typescript
{
  topic: string,                          // e.g. "js-closures"
  difficulty?: "easy" | "medium" | "hard",
  bank?: string                           // custom bank ID, or default
}
```

### `assessment_list_topics`

Lists available topics in a bank.

```typescript
{
  bank?: string
}
```

### `assessment_list_banks`

Lists available item banks (default + custom).

### `assessment_log_response`

Records a user's answer for progress tracking.

```typescript
{
  item_id: string,
  selected: string,      // "A", "B", "C", "D"
  correct: boolean,
  latency_ms: number,
  user_id: string,       // provided by clone
  session_id?: string
}
```

## MCQ Protocol

When Claude wants to show a question, it wraps the JSON in delimiters:

```
:::mcq
{
  "id": "js-closures-1",
  "stem": "What will this code output?",
  "code": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
  "options": [
    {"key": "A", "text": "0, 1, 2"},
    {"key": "B", "text": "3, 3, 3"},
    {"key": "C", "text": "undefined, undefined, undefined"},
    {"key": "D", "text": "ReferenceError"}
  ],
  "correct": "B",
  "feedback": {
    "correct": "Right! `var` is function-scoped, so all callbacks share the same `i`, which is 3 after the loop.",
    "incorrect": "Remember that `var` is function-scoped, not block-scoped. By the time the callbacks run, the loop has finished."
  }
}
:::
```

Your UI parses these blocks and renders an interactive card.

## Authentication

Two-layer auth model:

| Layer | Purpose | Mechanism |
|-------|---------|-----------|
| Clone → MCQMCP | Identifies the integrating app | API key in `Authorization` header |
| User context | Tracks individual progress | `X-User-ID` header (opaque ID from clone) |

The clone handles its own user authentication. MCQMCP just needs a consistent user identifier to associate responses.

```
Authorization: Bearer <clone_api_key>
X-User-ID: <your_user_id>
```

## REST API

Beyond MCP tools, direct HTTP endpoints for clones and analytics:

**User data (for clones):**
```
GET  /users/{user_id}/progress    # Aggregated stats
GET  /users/{user_id}/responses   # Response history
```

**Item banks:**
```
GET  /banks                        # List available banks
POST /banks                        # Upload custom item bank
GET  /banks/{bank_id}/items        # List items in a bank
```

**Analytics (for learning engineers):**
```
GET  /analytics/items/{item_id}    # Item performance metrics
GET  /analytics/banks/{bank_id}    # Aggregate bank statistics
GET  /analytics/responses          # Export response data (with filters)
```

## Item Banks

MCQMCP ships with a default bank covering frontend engineering:

- `js-this`, `js-closures`, `js-async`, `js-prototypes`
- `js-timers`, `js-patterns`, `html-events`

You can create custom banks for any domain:
- Company onboarding
- Certification prep
- Course materials
- Compliance training

## Integrating with Your Clone

### 1. Connect to MCP server

Configure your Claude integration to use MCQMCP's HTTP endpoint.

### 2. Parse MCQ blocks

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

### 3. Render MCQ cards

Build a component that:
- Displays the question stem and code (if any)
- Shows clickable options
- Reveals feedback on selection
- Tracks time from render to click (latency_ms)

### 4. Log responses

After user answers, call `assessment_log_response` with the result.

## Development

```bash
npm install
npm run dev
```

## Tech Stack

- **Runtime**: Node.js
- **Protocol**: MCP over HTTP+SSE
- **Database**: Postgres
- **Validation**: Zod

## License

MIT
