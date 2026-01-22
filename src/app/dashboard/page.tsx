import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { createServerClient } from '@/lib/supabase/server';
import { Deck } from '@/lib/supabase/types';
import { GenerateDeckForm } from './generate-form';

export const dynamic = 'force-dynamic';

async function getDecks(userId: string): Promise<Deck[]> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching decks:', error);
    return [];
  }
  
  return data || [];
}

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const decks = await getDecks(userId);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!</h1>
        <div className="dashboard-actions">
          <Link href="/" className="btn btn-ghost btn-sm">
            Home
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <section className="generate-section">
        <h2>Generate New Deck</h2>
        <GenerateDeckForm />
      </section>

      <section className="decks-section">
        <h2>Your Decks ({decks.length})</h2>
        
        {decks.length === 0 ? (
          <div className="empty-state">
            <h3>No decks yet</h3>
            <p>Generate your first flashcard deck by entering a topic above!</p>
          </div>
        ) : (
          <div className="decks-grid">
            {decks.map((deck) => (
              <Link href={`/deck/${deck.id}`} key={deck.id} className="deck-card">
                <h3>{deck.title}</h3>
                <p className="deck-card-topic">{deck.topic}</p>
                <div className="deck-card-meta">
                  <span>{deck.cards.length} cards</span>
                  <span>{new Date(deck.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
