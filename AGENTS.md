# AGENTS.md - VibeCards Codebase Documentation

This document provides guidance for AI agents working with the VibeCards codebase.

## Overview

VibeCards is an authenticated AI flashcard application. Users sign in, enter a topic, and receive AI-generated flashcard decks that are saved for later review.

## Architecture

```
User → Clerk Auth → Next.js App → OpenAI API (generate cards)
                               → Supabase (store/retrieve decks)
```

## Key Files

### Authentication
- `src/middleware.ts` - Clerk middleware protecting routes
- `src/app/providers.tsx` - ClerkProvider wrapper (must be 'use client')
- `src/app/sign-in/[[...sign-in]]/page.tsx` - Sign-in page
- `src/app/sign-up/[[...sign-up]]/page.tsx` - Sign-up page

### Database
- `src/lib/supabase/server.ts` - Server-side Supabase client (uses service role key)
- `src/lib/supabase/client.ts` - Browser Supabase client (uses anon key)
- `src/lib/supabase/types.ts` - TypeScript types for Deck and Card
- `supabase/schema.sql` - Database schema

### Pages
- `src/app/page.tsx` - Public landing page
- `src/app/dashboard/page.tsx` - Protected dashboard (lists user's decks)
- `src/app/dashboard/generate-form.tsx` - Client component for deck generation
- `src/app/deck/[id]/page.tsx` - Individual deck view

### API
- `src/app/api/generate-deck/route.ts` - Deck generation endpoint

## Critical Implementation Details

### 1. Auth Protection
All pages under `/dashboard` and `/deck/*` are protected by Clerk middleware. The middleware uses `createRouteMatcher` to define public routes.

### 2. Owner Filtering
**CRITICAL**: The dashboard and deck detail pages MUST filter by `owner_id`:
```typescript
.eq('owner_id', userId)
```
This prevents users from seeing others' decks.

### 3. Dynamic Pages
Pages using Clerk auth must export:
```typescript
export const dynamic = 'force-dynamic';
```
This prevents Next.js static generation errors.

### 4. OpenAI Client Instantiation
The OpenAI client is instantiated INSIDE the route handler, not at module level:
```typescript
export async function POST(request: Request) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // ...
}
```
This avoids build errors when env vars aren't available at build time.

### 5. Structured Outputs
The API uses OpenAI's Responses API with Zod schemas:
```typescript
const response = await openai.responses.parse({
  model: 'gpt-5.2',
  text: { format: zodTextFormat(DeckSchema, 'flashcard_deck') },
  // ...
});
```

## Data Model

### decks table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| owner_id | TEXT | Clerk user ID |
| title | TEXT | Deck title |
| topic | TEXT | Original topic input |
| cards | JSONB | Array of {front, back} |
| created_at | TIMESTAMPTZ | Creation timestamp |

## Guardrails

- Topic max length: 200 characters
- Cards per deck: 8-12
- Max output tokens: 2000

## Environment Variables

Required:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## Common Tasks

### Adding a new protected route
1. Create the page in `src/app/your-route/page.tsx`
2. Add `export const dynamic = 'force-dynamic'`
3. Use `await auth()` to get the userId
4. The middleware will handle protection automatically

### Modifying the deck schema
1. Update `supabase/schema.sql`
2. Update `src/lib/supabase/types.ts`
3. Update the Zod schema in `src/app/api/generate-deck/route.ts`

### Adding new API endpoints
1. Create route at `src/app/api/your-endpoint/route.ts`
2. Use `await auth()` for protection
3. Return `NextResponse.json()` for responses
