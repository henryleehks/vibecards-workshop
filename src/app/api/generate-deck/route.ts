import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { zodTextFormat } from 'openai/helpers/zod';
import { createServerClient } from '@/lib/supabase/server';

// Zod schema for the deck structure
const CardSchema = z.object({
  front: z.string().describe('The question or prompt on the front of the card'),
  back: z.string().describe('The answer or explanation on the back of the card'),
});

const DeckSchema = z.object({
  title: z.string().describe('A concise, descriptive title for this flashcard deck'),
  topic: z.string().describe('The main topic this deck covers'),
  cards: z.array(CardSchema).min(8).max(12).describe('Array of 8-12 flashcards'),
});

type DeckOutput = z.infer<typeof DeckSchema>;

// Guardrails
const MAX_TOPIC_LENGTH = 200;
const MAX_OUTPUT_TOKENS = 2000;

export async function POST(request: Request) {
  try {
    // Auth check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { topic } = body;

    // Validate topic
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const trimmedTopic = topic.trim();
    if (trimmedTopic.length === 0) {
      return NextResponse.json(
        { error: 'Topic cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedTopic.length > MAX_TOPIC_LENGTH) {
      return NextResponse.json(
        { error: `Topic must be ${MAX_TOPIC_LENGTH} characters or less` },
        { status: 400 }
      );
    }

    // Instantiate OpenAI client inside the handler (not at module level)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Generate flashcards using OpenAI Responses API with structured outputs
    const response = await openai.responses.parse({
      model: 'gpt-5.2',
      instructions: `You are an expert educator creating flashcards. Generate a set of 8-12 high-quality flashcards for studying the given topic. 

Each card should:
- Have a clear, specific question or prompt on the front
- Have a concise but comprehensive answer on the back
- Cover different aspects of the topic
- Progress from basic concepts to more advanced ones
- Be educational and accurate

Create flashcards that would help a student thoroughly understand and remember the topic.`,
      input: `Create flashcards for the topic: "${trimmedTopic}"`,
      text: {
        format: zodTextFormat(DeckSchema, 'flashcard_deck'),
      },
      max_output_tokens: MAX_OUTPUT_TOKENS,
    });

    // Extract the parsed deck
    const deck: DeckOutput = response.output_parsed as DeckOutput;

    if (!deck || !deck.cards || deck.cards.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate flashcards' },
        { status: 500 }
      );
    }

    // Save to Supabase
    const supabase = createServerClient();
    
    const { data, error } = await supabase
      .from('decks')
      .insert({
        owner_id: userId,
        title: deck.title,
        topic: deck.topic,
        cards: deck.cards,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save deck' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      deckId: data.id,
      title: deck.title,
      cardCount: deck.cards.length,
    });

  } catch (error) {
    console.error('Generate deck error:', error);
    
    // Handle specific OpenAI errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'AI service error. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
