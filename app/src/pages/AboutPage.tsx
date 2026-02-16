import AppHeader from "../components/layout/AppHeader";
import DecorativeBackground from "../components/layout/DecorativeBackground";
import EntranceAnimator from "../components/primitives/EntranceAnimator";
import SiteNav from "../components/layout/SiteNav";

function AboutPage() {
  return (
    <main className="app-shell">
      <DecorativeBackground />
      <section className="card page-card">
        <AppHeader title="About" subtitle="Product principles, safety posture, and design intent." />
        <SiteNav />

        <section className="info-grid" aria-label="About Open Me">
          <EntranceAnimator>
            <article className="info-card">
              <h3>Purpose</h3>
              <p>
                Open Me is built for meaningful communication: letters that open with intention, not noise.
              </p>
            </article>
          </EntranceAnimator>
          <EntranceAnimator delay={0.06}>
            <article className="info-card">
              <h3>Trust</h3>
              <p>
                Hardened API routes, bounded payloads, and actor-aware CMS updates protect delivery and edits.
              </p>
            </article>
          </EntranceAnimator>
          <EntranceAnimator delay={0.1}>
            <article className="info-card">
              <h3>Reliability</h3>
              <p>
                Offline queueing, cached letters, and refresh controls keep experiences resilient across connections.
              </p>
            </article>
          </EntranceAnimator>
        </section>
      </section>
    </main>
  );
}

export default AboutPage;
