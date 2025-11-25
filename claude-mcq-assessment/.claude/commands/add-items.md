Add assessment items for topic: $ARGUMENTS

1. Read /lib/mcp/schemas/item.ts for the schema
2. Read existing /lib/mcp/item-bank.json
3. Generate 2-3 rigorous frontend engineering questions for this topic
4. Each item needs:
   - Unique ID (format: topic-difficulty-number, e.g., js-this-medium-1)
   - Clear stem with code snippet if applicable
   - 4 options (A, B, C, D) with plausible distractors
   - Correct answer key
   - Feedback for correct and incorrect responses
   - Difficulty (easy, medium, hard)
5. Validate against Zod schema
6. Add to item-bank.json
7. Report what was added
