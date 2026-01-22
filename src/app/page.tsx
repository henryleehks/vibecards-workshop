import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="landing-logo">VibeCards</div>
        <div className="landing-nav-links">
          <SignedOut>
            <Link href="/sign-in" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
          </SignedIn>
        </div>
      </nav>

      <main className="landing-hero">
        <h1>
          Learn Anything with
          <br />
          <span>AI-Powered Flashcards</span>
        </h1>
        <p>
          Enter any topic and instantly generate study-ready flashcards. 
          Powered by AI to help you learn faster and retain more.
        </p>
        <div className="landing-cta">
          <SignedOut>
            <Link href="/sign-up" className="btn btn-primary">
              Start Creating Free →
            </Link>
            <Link href="/sign-in" className="btn btn-secondary">
              Sign In
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard →
            </Link>
          </SignedIn>
        </div>
      </main>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Instant Generation</h3>
          <p>
            Just type a topic and get 8-12 high-quality flashcards in seconds.
            No manual card creation needed.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🧠</div>
          <h3>AI-Powered Content</h3>
          <p>
            Leveraging GPT-5.2 to create accurate, educational content 
            tailored to your learning needs.
          </p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📚</div>
          <h3>Save & Review</h3>
          <p>
            All your decks are saved to your account. Review them anytime,
            anywhere, on any device.
          </p>
        </div>
      </section>
    </div>
  );
}
