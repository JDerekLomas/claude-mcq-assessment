#!/usr/bin/env npx tsx
/**
 * Label items with skill_path and tags using an LLM.
 *
 * Usage:
 *   npx tsx scripts/label-items.ts [--dry-run] [--limit N]
 *
 * Environment variables:
 *   ZAI_API_KEY - Z.AI API key (uses GLM-4.6)
 *   ANTHROPIC_API_KEY - Anthropic API key (uses Claude)
 *
 * Uses Z.AI by default if ZAI_API_KEY is set, otherwise Anthropic.
 */

import * as fs from 'fs';
import * as path from 'path';

const ITEM_BANK_PATH = path.join(__dirname, '../src/lib/mcp/item-bank.json');

interface Option {
  id: string;
  text: string;
}

interface Feedback {
  correct: string;
  incorrect: string;
  explanation: string;
}

interface Item {
  id: string;
  topic: string;
  difficulty: string;
  stem: string;
  code?: string;
  options: Option[];
  correct: string;
  feedback: Feedback;
  skill_path?: string[];
  tags?: string[];
}

interface ItemBank {
  version: string;
  items: Item[];
}

const SKILL_TAXONOMY = `
# Skill Taxonomy

Use these hierarchical paths. Choose the most specific applicable path.

## JavaScript Core
- ["javascript", "fundamentals", "variables"]
- ["javascript", "fundamentals", "types"]
- ["javascript", "fundamentals", "operators"]
- ["javascript", "this-binding", "implicit"]
- ["javascript", "this-binding", "explicit"]
- ["javascript", "this-binding", "arrow-functions"]
- ["javascript", "closures", "lexical-scope"]
- ["javascript", "closures", "practical-uses"]
- ["javascript", "closures", "loop-gotchas"]
- ["javascript", "async", "promises"]
- ["javascript", "async", "async-await"]
- ["javascript", "async", "event-loop"]
- ["javascript", "async", "microtasks"]
- ["javascript", "prototypes", "inheritance"]
- ["javascript", "prototypes", "proto-chain"]
- ["javascript", "timers", "setTimeout"]
- ["javascript", "timers", "setInterval"]
- ["javascript", "timers", "execution-order"]
- ["javascript", "patterns", "module"]
- ["javascript", "patterns", "factory"]
- ["javascript", "patterns", "singleton"]

## DOM & Events
- ["dom", "events", "bubbling"]
- ["dom", "events", "capturing"]
- ["dom", "events", "delegation"]
- ["dom", "events", "preventDefault"]
- ["dom", "manipulation", "selection"]
- ["dom", "manipulation", "modification"]

## React
- ["react", "hooks", "useState"]
- ["react", "hooks", "useEffect"]
- ["react", "hooks", "useRef"]
- ["react", "hooks", "useMemo"]
- ["react", "hooks", "useCallback"]
- ["react", "hooks", "custom"]
- ["react", "state", "lifting"]
- ["react", "state", "context"]
- ["react", "state", "derived"]
- ["react", "rendering", "reconciliation"]
- ["react", "rendering", "keys"]
- ["react", "rendering", "memoization"]
- ["react", "patterns", "composition"]
- ["react", "patterns", "render-props"]
- ["react", "patterns", "controlled-components"]

## AI-Assisted Development (Vibe Coding)
- ["vibe-coding", "prompting", "clarity"]
- ["vibe-coding", "prompting", "context"]
- ["vibe-coding", "prompting", "iteration"]
- ["vibe-coding", "review", "correctness"]
- ["vibe-coding", "review", "security"]
- ["vibe-coding", "review", "edge-cases"]
- ["vibe-coding", "workflow", "integration"]
- ["vibe-coding", "workflow", "validation"]

## Biology
- ["biology", "immunology", "plasma-cells"]
- ["biology", "immunology", "antibodies"]
- ["biology", "immunology", "b-cells"]
- ["biology", "cell-biology", "differentiation"]
`;

const TAG_GUIDELINES = `
# Tag Guidelines

Add 2-5 tags that describe:
1. Cognitive skill tested (recall, comprehension, application, analysis)
2. Common misconception addressed (if any)
3. Specific concept (e.g., "var-vs-let", "arrow-function-this")
4. Context (e.g., "interview-question", "gotcha", "best-practice")

Example tags: ["application", "common-misconception", "var-hoisting", "gotcha"]
`;

function buildPrompt(item: Item): string {
  return `You are labeling assessment items with metadata for a learning measurement system.

${SKILL_TAXONOMY}

${TAG_GUIDELINES}

# Item to Label

ID: ${item.id}
Topic: ${item.topic}
Difficulty: ${item.difficulty}
Stem: ${item.stem}
${item.code ? `Code:\n\`\`\`\n${item.code}\n\`\`\`` : ''}
Options:
${item.options.map(o => `  ${o.id}. ${o.text}`).join('\n')}
Correct: ${item.correct}
Explanation: ${item.feedback.explanation}

# Your Task

Return a JSON object with:
1. "skill_path": The most specific applicable path from the taxonomy (array of strings)
2. "tags": 2-5 descriptive tags (array of strings)

Return ONLY the JSON object, no other text.`;
}

async function labelItemWithZAI(apiKey: string, item: Item): Promise<{ skill_path: string[]; tags: string[] }> {
  const response = await fetch('https://api.z.ai/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'glm-4.6',
      messages: [{ role: 'user', content: buildPrompt(item) }],
      max_tokens: 512,
      temperature: 0.3,
      thinking: { type: 'disabled' }, // Use direct mode, not reasoning mode
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Z.AI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';

  return parseLabels(text);
}

async function labelItemWithAnthropic(apiKey: string, item: Item): Promise<{ skill_path: string[]; tags: string[] }> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [{ role: 'user', content: buildPrompt(item) }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return parseLabels(text);
}

function parseLabels(text: string): { skill_path: string[]; tags: string[] } {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to parse JSON from response: ${text}`);
  }

  const result = JSON.parse(jsonMatch[0]);

  if (!Array.isArray(result.skill_path) || !Array.isArray(result.tags)) {
    throw new Error(`Invalid response structure: ${JSON.stringify(result)}`);
  }

  return {
    skill_path: result.skill_path,
    tags: result.tags,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitIndex = args.indexOf('--limit');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : undefined;

  const zaiKey = process.env.ZAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!zaiKey && !anthropicKey) {
    console.error('Error: Either ZAI_API_KEY or ANTHROPIC_API_KEY environment variable required');
    process.exit(1);
  }

  const useZAI = !!zaiKey;
  console.log(`Using ${useZAI ? 'Z.AI (GLM-4.6)' : 'Anthropic (Claude)'}`);

  // Load item bank
  const bankData = fs.readFileSync(ITEM_BANK_PATH, 'utf-8');
  const bank: ItemBank = JSON.parse(bankData);

  // Filter to items without labels
  let itemsToLabel = bank.items.filter(item => !item.skill_path || !item.tags);

  if (limit) {
    itemsToLabel = itemsToLabel.slice(0, limit);
  }

  console.log(`Found ${itemsToLabel.length} items to label${limit ? ` (limited to ${limit})` : ''}`);
  if (dryRun) {
    console.log('DRY RUN - no changes will be saved\n');
  }

  let labeled = 0;
  let errors = 0;

  for (const item of itemsToLabel) {
    try {
      console.log(`Labeling ${item.id}...`);

      const labels = useZAI
        ? await labelItemWithZAI(zaiKey!, item)
        : await labelItemWithAnthropic(anthropicKey!, item);

      console.log(`  skill_path: ${JSON.stringify(labels.skill_path)}`);
      console.log(`  tags: ${JSON.stringify(labels.tags)}`);

      if (!dryRun) {
        const bankItem = bank.items.find(i => i.id === item.id);
        if (bankItem) {
          bankItem.skill_path = labels.skill_path;
          bankItem.tags = labels.tags;
        }
      }

      labeled++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (err) {
      console.error(`  Error: ${err instanceof Error ? err.message : err}`);
      errors++;
    }
  }

  console.log(`\nLabeled ${labeled} items, ${errors} errors`);

  if (!dryRun && labeled > 0) {
    fs.writeFileSync(ITEM_BANK_PATH, JSON.stringify(bank, null, 2) + '\n');
    console.log('Saved updated item bank');
  }
}

main().catch(console.error);
