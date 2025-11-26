import { NextRequest, NextResponse } from 'next/server';
import {
  UserContextSchema,
  createEmptyUserContext,
  type UserContext
} from '@/lib/storage/schemas';

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

/**
 * GET /api/context?sessionId=xxx
 * Retrieves user context for a session
 */
export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    // If Postgres isn't configured, return empty context
    const db = await getDbFunctions();
    if (!db) {
      return NextResponse.json(createEmptyUserContext(sessionId));
    }

    const context = await db.getUserContext(sessionId);

    if (!context) {
      return NextResponse.json(createEmptyUserContext(sessionId));
    }

    const validated = UserContextSchema.safeParse(context);
    if (!validated.success) {
      console.warn('Invalid stored context, returning fresh:', validated.error);
      return NextResponse.json(createEmptyUserContext(sessionId));
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    console.error('Get context error:', error);
    // Return empty context on error so the app still works
    const sessionId = request.nextUrl.searchParams.get('sessionId') || '';
    return NextResponse.json(createEmptyUserContext(sessionId));
  }
}

/**
 * POST /api/context
 * Saves user context
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = UserContextSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid context data', details: validated.error.issues },
        { status: 400 }
      );
    }

    const context: UserContext = {
      ...validated.data,
      updatedAt: new Date().toISOString(),
    };

    // If Postgres isn't configured, just return success (data won't persist)
    const db = await getDbFunctions();
    if (db) {
      await db.saveUserContext(context.sessionId, context);
    }

    return NextResponse.json({ success: true, sessionId: context.sessionId });
  } catch (error) {
    console.error('Save context error:', error);
    // Return success anyway - the app will work, just without persistence
    return NextResponse.json({ success: true });
  }
}

/**
 * PATCH /api/context
 * Partially updates user context (merges with existing)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, ...updates } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const db = await getDbFunctions();

    // Load existing or create new
    const existingContext = db
      ? (await db.getUserContext(sessionId) || createEmptyUserContext(sessionId))
      : createEmptyUserContext(sessionId);

    // Merge updates
    const updatedContext: UserContext = {
      ...existingContext,
      ...updates,
      // Deep merge learnerProfile if provided
      learnerProfile: updates.learnerProfile
        ? { ...existingContext.learnerProfile, ...updates.learnerProfile }
        : existingContext.learnerProfile,
      updatedAt: new Date().toISOString(),
    };

    // Validate merged result
    const validated = UserContextSchema.safeParse(updatedContext);
    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid merged context', details: validated.error.issues },
        { status: 400 }
      );
    }

    if (db) {
      await db.saveUserContext(sessionId, validated.data);
    }

    return NextResponse.json({ success: true, context: validated.data });
  } catch (error) {
    console.error('Patch context error:', error);
    return NextResponse.json({ success: true });
  }
}
