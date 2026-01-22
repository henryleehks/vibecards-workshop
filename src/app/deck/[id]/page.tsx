import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Deck } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

async function getDeck(deckId: string, userId: string): Promise<Deck | null> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('id', deckId)
    .eq('owner_id', userId)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return data;
}

interface DeckPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const deck = await getDeck(id, userId);

  if (!deck) {
    notFound();
  }

  return (
    <div className="deck-page">
      <header className="deck-page-header">
        <Link href="/dashboard" className="deck-page-back">
          ← Back to Dashboard
        </Link>
        <h1>{deck.title}</h1>
        <p className="deck-page-topic">Topic: {deck.topic}</p>
        <p className="deck-page-topic" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
          {deck.cards.length} cards • Created {new Date(deck.created_at).toLocaleDateString()}
        </p>
      </header>

      <div className="cards-grid">
        {deck.cards.map((card, index) => (
          <div key={index} className="flashcard">
            <div className="flashcard-front">
              <span style={{ color: 'var(--muted)', fontSize: '0.75rem', marginRight: '0.5rem' }}>
                Q{index + 1}:
              </span>
              {card.front}
            </div>
            <div className="flashcard-back">{card.back}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
