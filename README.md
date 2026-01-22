# VibeCards

AI-powered flashcard generator built with Next.js, Clerk, Supabase, and OpenAI.

## Features

- **AI-Powered Generation**: Enter any topic and get 8-12 high-quality flashcards instantly
- **User Authentication**: Secure sign-in/sign-up with Clerk
- **Persistent Storage**: All decks saved to Supabase for later review
- **Private by Default**: Users can only view their own decks

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI Responses API with Structured Outputs (Zod)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Clerk account ([dashboard.clerk.com](https://dashboard.clerk.com))
- Supabase project ([supabase.com](https://supabase.com))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd vibecards-workshop
npm install
```

### 2. Set Up Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk Dashboard
- `CLERK_SECRET_KEY` - From Clerk Dashboard
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase Settings > API
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase Settings > API
- `OPENAI_API_KEY` - From OpenAI Platform

### 3. Set Up Supabase Database

Run the schema in your Supabase SQL Editor:

```sql
-- From supabase/schema.sql
CREATE TABLE IF NOT EXISTS decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  cards JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_decks_owner_id ON decks(owner_id);
CREATE INDEX IF NOT EXISTS idx_decks_created_at ON decks(created_at DESC);
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

### Option 1: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

### Option 2: Manual Deploy

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
5. Deploy!

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-deck/   # POST endpoint for deck generation
│   ├── dashboard/           # Protected dashboard page
│   ├── deck/[id]/           # Individual deck view
│   ├── sign-in/             # Clerk sign-in page
│   ├── sign-up/             # Clerk sign-up page
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   └── providers.tsx        # ClerkProvider wrapper
├── lib/
│   └── supabase/            # Supabase client utilities
└── middleware.ts            # Clerk auth middleware
```

## API Endpoints

### POST /api/generate-deck

Generate a new flashcard deck.

**Request:**
```json
{
  "topic": "JavaScript Promises"
}
```

**Response:**
```json
{
  "deckId": "uuid",
  "title": "JavaScript Promises Flashcards",
  "cardCount": 10
}
```

## License

MIT
