import { getItem, getItemToolDefinition } from './get-item';
import { listTopics, listTopicsToolDefinition } from './list-topics';
import type { Item } from '../schemas/item';
import type { TopicInfo } from './list-topics';

/**
 * All available tool definitions for Claude's tool use.
 */
export const toolDefinitions = [
  getItemToolDefinition,
  listTopicsToolDefinition,
] as const;

/**
 * Result type for tool execution.
 */
export type ToolResult =
  | { success: true; data: Item | TopicInfo[] | null }
  | { success: false; error: string };

/**
 * Executes a tool by name with the provided input.
 *
 * @param toolName - The name of the tool to execute
 * @param input - The input parameters for the tool
 * @returns The tool result or an error
 */
export function executeTool(toolName: string, input: unknown): ToolResult {
  switch (toolName) {
    case 'assessment_get_item':
      try {
        const item = getItem(input);
        return { success: true, data: item };
      } catch (error) {
        return {
          success: false,
          error: `Failed to get item: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }

    case 'assessment_list_topics':
      try {
        const topics = listTopics();
        return { success: true, data: topics };
      } catch (error) {
        return {
          success: false,
          error: `Failed to list topics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }

    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}

// Re-export for convenience
export { getItem, getItemToolDefinition } from './get-item';
export { listTopics, listTopicsToolDefinition } from './list-topics';
