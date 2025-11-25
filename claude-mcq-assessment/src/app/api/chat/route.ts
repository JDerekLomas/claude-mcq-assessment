import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { toolDefinitions, executeTool } from '@/lib/mcp/tools';

const anthropic = new Anthropic();

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const RequestSchema = z.object({
  messages: z.array(MessageSchema).min(1),
});

const SYSTEM_PROMPT = `You are a frontend engineering tutor who assesses students using multiple choice questions from a validated item bank.

## How to Present Questions

When you receive an item from the assessment_get_item tool, you MUST present it using the :::mcq protocol. Wrap the question JSON in :::mcq delimiters like this:

:::mcq
{"id":"the-item-id","stem":"The question text","code":"optional code snippet","options":[{"id":"A","text":"Option A"},{"id":"B","text":"Option B"},{"id":"C","text":"Option C"},{"id":"D","text":"Option D"}],"correct":"A","feedback":{"correct":"...","incorrect":"...","explanation":"..."}}
:::

## Important Rules

1. ALWAYS use the assessment_get_item tool to retrieve questions. Never make up questions.
2. ALWAYS wrap the item JSON in :::mcq delimiters exactly as shown above.
3. After presenting the question, wait for the user's answer before providing feedback.
4. Keep your introductions brief - just present the question.
5. Use assessment_list_topics to show available topics if the user asks what's available.

## Topics Available
- js-this: JavaScript \`this\` binding
- js-closures: Closures and lexical scoping
- js-async: Promises and async/await
- js-prototypes: Prototypal inheritance
- js-timers: setTimeout, microtasks, event loop
- js-patterns: Destructuring, spread, getters
- html-events: Event bubbling and delegation`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { messages } = parsed.data;

    // Convert messages to Anthropic format
    const anthropicMessages: Anthropic.MessageParam[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    // Tool execution loop
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: toolDefinitions.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema as unknown as Anthropic.Tool['input_schema'],
      })),
      messages: anthropicMessages,
    });

    // Process tool calls in a loop until we get a final response
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = toolUseBlocks.map(toolUse => {
        const result = executeTool(toolUse.name, toolUse.input);

        if (result.success) {
          return {
            type: 'tool_result' as const,
            tool_use_id: toolUse.id,
            content: JSON.stringify(result.data),
          };
        } else {
          return {
            type: 'tool_result' as const,
            tool_use_id: toolUse.id,
            content: JSON.stringify({ error: result.error }),
            is_error: true,
          };
        }
      });

      // Add assistant response and tool results to messages
      anthropicMessages.push({
        role: 'assistant',
        content: response.content,
      });

      anthropicMessages.push({
        role: 'user',
        content: toolResults,
      });

      // Continue the conversation
      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools: toolDefinitions.map(t => ({
          name: t.name,
          description: t.description,
          input_schema: t.input_schema as unknown as Anthropic.Tool['input_schema'],
        })),
        messages: anthropicMessages,
      });
    }

    // Extract final text response
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === 'text'
    );

    const assistantMessage = textBlocks.map(b => b.text).join('\n');

    return NextResponse.json({
      role: 'assistant',
      content: assistantMessage,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'Anthropic API error', message: error.message },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
