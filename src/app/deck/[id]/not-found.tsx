import Link from 'next/link';

export default function DeckNotFound() {
  return (
    <div className="deck-page">
      <div className="empty-state">
        <h3>Deck Not Found</h3>
        <p>This deck doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
