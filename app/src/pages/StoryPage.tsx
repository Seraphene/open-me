import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import DecorativeBackground from "../components/layout/DecorativeBackground";
import EntranceAnimator from "../components/primitives/EntranceAnimator";
import SiteNav from "../components/layout/SiteNav";

function StoryPage() {
  return (
    <main className="app-shell">
      <DecorativeBackground />
      <section className="card story-card">
        <AppHeader
          title="Story"
          subtitle="Why Open Me exists and how it turns letters into moments."
        />
        <SiteNav />

        <section className="story-timeline" aria-label="Open Me story timeline">
          <EntranceAnimator>
            <article className="story-step">
              <p className="story-step-index">01</p>
              <div>
                <h3>Capture a feeling</h3>
                <p>Each envelope starts with an intention: comfort, celebration, clarity, or reassurance.</p>
              </div>
            </article>
          </EntranceAnimator>

          <EntranceAnimator delay={0.06}>
            <article className="story-step">
              <p className="story-step-index">02</p>
              <div>
                <h3>Choose a lock</h3>
                <p>Honor-lock and time-lock modes create anticipation while preserving emotional safety.</p>
              </div>
            </article>
          </EntranceAnimator>

          <EntranceAnimator delay={0.12}>
            <article className="story-step">
              <p className="story-step-index">03</p>
              <div>
                <h3>Deliver confidently</h3>
                <p>CMS edits, receipt telemetry, and offline sync build trust in delivery and access continuity.</p>
              </div>
            </article>
          </EntranceAnimator>
        </section>

        <section className="story-cta" aria-label="Continue">
          <Link className="hero-button" to="/open">
            Launch experience
          </Link>
        </section>
      </section>
    </main>
  );
}

export default StoryPage;
