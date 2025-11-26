import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Check if Postgres is configured
const isPostgresConfigured = () => {
  return !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
};

// Dynamic import to avoid errors when Postgres isn't configured
async function getDbFunctions() {
  if (!isPostgresConfigured()) {
    return null;
  }
  try {
    return await import('@/lib/db');
  } catch {
    return null;
  }
}

const ResponseSchema = z.object({
  item_id: z.string(),
  selected: z.string(),
  correct: z.string(),
  is_correct: z.boolean(),
  latency_ms: z.number(),
  timestamp: z.string(),
  session_id: z.string(),
});

const GeneratedItemSchema = z.object({
  type: z.literal('generated_item'),
  item: z.object({
    id: z.string(),
    topic: z.string(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    stem: z.string(),
    code: z.string().optional(),
    options: z.array(z.object({
      id: z.string(),
      text: z.string(),
    })),
    correct: z.string(),
    feedback: z.object({
      correct: z.string(),
      incorrect: z.string(),
      explanation: z.string(),
    }),
  }),
  timestamp: z.string(),
  session_id: z.string(),
});

const LogRequestSchema = z.union([ResponseSchema, GeneratedItemSchema]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LogRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const db = await getDbFunctions();

    if ('type' in data && data.type === 'generated_item') {
      // Log generated item (only if Postgres is configured)
      if (db) {
        await db.logGeneratedItem({
          session_id: data.session_id,
          item_id: data.item.id,
          item_data: data.item,
        });
      }

      return NextResponse.json({
        success: true,
        type: 'generated_item',
        item_id: data.item.id
      });
    } else {
      // Log response (only if Postgres is configured)
      const responseData = data as z.infer<typeof ResponseSchema>;
      if (db) {
        await db.logResponse({
          session_id: responseData.session_id,
          item_id: responseData.item_id,
          selected: responseData.selected,
          correct: responseData.correct,
          is_correct: responseData.is_correct,
          latency_ms: responseData.latency_ms,
        });
      }

      return NextResponse.json({
        success: true,
        type: 'response',
        item_id: responseData.item_id,
        is_correct: responseData.is_correct
      });
    }
  } catch (error) {
    console.error('Log API error:', error);
    // Return success anyway - logging is non-critical
    return NextResponse.json({ success: true });
  }
}

export async function GET() {
  try {
    const db = await getDbFunctions();

    if (!db) {
      // Return empty stats if Postgres isn't configured
      return NextResponse.json({
        stats: {
          total_responses: 0,
          correct_responses: 0,
          accuracy_percent: '0',
          generated_items_count: 0,
        },
        recent_responses: [],
        recent_generated: [],
        note: 'Database not configured - stats not available',
      });
    }

    const stats = await db.getResponseStats();
    const recentResponses = await db.getRecentResponses(10);
    const recentGenerated = await db.getRecentGeneratedItems(5);

    return NextResponse.json({
      stats,
      recent_responses: recentResponses,
      recent_generated: recentGenerated,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({
      stats: {
        total_responses: 0,
        correct_responses: 0,
        accuracy_percent: '0',
        generated_items_count: 0,
      },
      recent_responses: [],
      recent_generated: [],
    });
  }
}
