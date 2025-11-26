# MCQ Assessment System

## What This Is
A pixel-perfect clone of Claude.ai's chat interface with one addition: interactive MCQ assessment cards that render inline. The goal is to be indistinguishable from claude.ai except when MCQ blocks appear.

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

---

## UI Implementation: Claude.ai Clone

### Primary Goal
**Pixel-perfect replication of Claude.ai's interface.** The app should be visually indistinguishable from claude.ai. Study the real claude.ai carefully and match every detail.

### Critical UI Requirements

#### 1. Markdown Rendering (HIGH PRIORITY)
Claude.ai renders markdown beautifully. Our app MUST support:
- **Headers** (h1-h6) with proper sizing and spacing
- **Bold**, *italic*, `inline code`
- **Code blocks** with syntax highlighting (use Shiki or Prism)
- **Bullet lists** and **numbered lists** with proper indentation
- **Blockquotes** with left border styling
- **Links** styled appropriately
- **Tables** if Claude outputs them
- Use `react-markdown` with `remark-gfm` for GitHub Flavored Markdown

#### 2. Typography & Fonts
- Claude.ai uses system fonts: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, etc.`
- Serif font for "Claude" branding (Tiempos or similar)
- Message text: 15-16px, line-height 1.6
- Code: monospace font (SF Mono, Monaco, or similar)

#### 3. Color Palette (extract from claude.ai)
- Background: #FFFFFF (main), #F9F9F8 (sidebar)
- Primary accent: #C15F3C (terracotta/rust) - used sparingly
- Text: #1A1A1A (primary), #666666 (secondary), #999999 (tertiary)
- Borders: #E5E5E3 (light), #D4D4D1 (default)
- User message background: subtle cream/beige tint
- Assistant messages: no background, just text

#### 4. Layout Structure
```
+------------------+----------------------------------------+
| Sidebar          | Chat Area                              |
| - New chat btn   | +------------------------------------+ |
| - Chat history   | | Header (model selector)            | |
| - Settings       | +------------------------------------+ |
|                  | | Message Thread (scrollable)        | |
|                  | | - User messages (right-aligned?)   | |
|                  | | - Assistant messages               | |
|                  | | - MCQ cards (inline)               | |
|                  | +------------------------------------+ |
|                  | | Input Area                         | |
|                  | | - Textarea (auto-resize)           | |
|                  | | - Attachment btn, send btn         | |
+------------------+----------------------------------------+
```

#### 5. Message Styling
- User messages: may have slight background tint, right-aligned avatar/initials
- Assistant messages: "Claude" label with icon, clean text rendering
- Smooth fade-in animation on new messages
- Auto-scroll to bottom on new messages

#### 6. Input Area
- Auto-resizing textarea (grows with content, max ~200px)
- Placeholder: "Message Claude..."
- Send button (arrow icon) appears when text is entered
- File attachment button (plus or paperclip icon)
- Keyboard: Enter to send, Shift+Enter for newline

#### 7. Sidebar
- "New chat" button prominent at top
- Conversation history grouped by date (Today, Yesterday, Previous 7 days)
- Hover states on conversation items
- Active conversation highlighted
- Collapsible on mobile

#### 8. Header
- Model selector dropdown (Claude 3.5 Sonnet, etc.)
- Clean, minimal design
- Optional: share button, settings

### MCQ Card Integration (Our Addition)
When :::mcq blocks appear, render the MCQCard component inline in the message thread:
- Card should feel native to Claude's design language
- Same border radius, shadow, spacing as Claude uses elsewhere
- Interactive states (hover, selected, correct/incorrect) match Claude's palette
- Feedback section appears below options after selection

### Animation Guidelines
- Message appear: fade-in + subtle slide-up (0.2-0.3s ease-out)
- MCQ option hover: slight lift (transform: translateY(-1px))
- MCQ selection: smooth color transitions (0.15s)
- Avoid jarring or flashy animations

### Responsive Design
- Sidebar collapses to hamburger menu below 768px
- Chat area remains usable on mobile
- Input area sticky at bottom on mobile

### Accessibility
- All interactive elements keyboard accessible
- Visible focus rings (outline)
- Color contrast meets WCAG AA
- aria-labels on icon buttons
- Screen reader announcements for MCQ feedback

### Reference
Open https://claude.ai in browser and use DevTools to inspect:
- Exact colors (use eyedropper)
- Font sizes and families
- Spacing/padding values
- Border radii
- Shadow values
- Transition timings
