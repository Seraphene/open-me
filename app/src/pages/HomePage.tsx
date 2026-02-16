import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import DecorativeBackground from "../components/layout/DecorativeBackground";
import EntranceAnimator from "../components/primitives/EntranceAnimator";
import SiteNav from "../components/layout/SiteNav";

function HomePage() {
  return (
    <main className="app-shell">
      <DecorativeBackground />
      <section className="card home-card">
        <AppHeader
          title="Open Me"
          subtitle="A crafted space for memory, timing, and meaningful moments."
        />
        <SiteNav />

        <EntranceAnimator>
          <section className="hero" aria-label="Open Me introduction">
            <p className="hero-kicker">Digital keepsakes</p>
            <h2>More than one page. A complete journey.</h2>
            <p className="hero-copy">
              Start with the interactive experience, then explore the product story behind the envelopes,
              trust, and emotional timing.
            </p>
            <div className="hero-actions">
              <Link className="hero-button" to="/open">
                Open the experience
              </Link>
              <Link className="hero-button hero-button--ghost" to="/story">
                View story
              </Link>
            </div>
          </section>
        </EntranceAnimator>

        <EntranceAnimator delay={0.08}>
          <section className="showcase-grid" aria-label="Highlights">
            <article className="showcase-card">
              <h3>Emotion-first UX</h3>
              <p>Soft theming, subtle motion, and focused interactions inspired by premium web experiences.</p>
            </article>
            <article className="showcase-card">
              <h3>Secure by default</h3>
              <p>Hardened serverless APIs, validation layers, and audit-aware CMS editing for confidence.</p>
            </article>
            <article className="showcase-card">
              <h3>Offline aware</h3>
              <p>Caching, queued events, and sync controls keep letters usable even with unstable connectivity.</p>
            </article>
          </section>
        </EntranceAnimator>
      </section>
    </main>
  );
}

export default HomePage;
