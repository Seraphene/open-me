import AppHeader from "../components/layout/AppHeader";
import DecorativeBackground from "../components/layout/DecorativeBackground";
import SiteNav from "../components/layout/SiteNav";

function ContactPage() {
  return (
    <main className="app-shell">
      <DecorativeBackground />
      <section className="card page-card">
        <AppHeader title="Contact" subtitle="Operational ownership and release checkpoints." />
        <SiteNav />

        <section className="contact-panel" aria-label="Contact and operations">
          <h3>Project Coordination</h3>
          <p>Use the runbook and handoff docs for release cadence, backups, and incident ownership.</p>
          <div className="contact-list">
            <p><strong>Runbook:</strong> docs/runbook.md</p>
            <p><strong>Handoff:</strong> docs/handoff.md</p>
            <p><strong>Architecture:</strong> docs/architecture.md</p>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ContactPage;
