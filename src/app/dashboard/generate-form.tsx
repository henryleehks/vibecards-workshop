'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MAX_TOPIC_LENGTH = 200;

export function GenerateDeckForm() {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setError('Please enter a topic');
      return;
    }

    if (trimmedTopic.length > MAX_TOPIC_LENGTH) {
      setError(`Topic must be ${MAX_TOPIC_LENGTH} characters or less`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-deck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: trimmedTopic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate deck');
      }

      setTopic('');
      router.refresh();
      router.push(`/deck/${data.deckId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="generate-form">
      {error && <div className="error-message">{error}</div>}
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Enter a topic (e.g., 'Photosynthesis', 'JavaScript Promises', 'World War II')"
        maxLength={MAX_TOPIC_LENGTH}
        disabled={isLoading}
      />
      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="spinner" />
            Generating...
          </>
        ) : (
          'Generate Deck'
        )}
      </button>
    </form>
  );
}
