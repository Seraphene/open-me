import AppHeader from "../components/layout/AppHeader";
import DecorativeBackground from "../components/layout/DecorativeBackground";
import EntranceAnimator from "../components/primitives/EntranceAnimator";
import SiteNav from "../components/layout/SiteNav";

const galleryItems = [
  {
    title: "Letter Dashboard",
    text: "A soft, card-based control surface for envelope status, locks, and sync metadata."
  },
  {
    title: "CMS Composer",
    text: "A controlled authoring flow for updating letters with actor identity and validation."
  },
  {
    title: "Story Layers",
    text: "Narrative sections that explain intent, pacing, and delivery trust in a visual sequence."
  },
  {
    title: "Offline Reliability",
    text: "Queue and flush controls to recover telemetry writes when connectivity returns."
  }
];

function GalleryPage() {
  return (
    <main className="app-shell">
      <DecorativeBackground />
      <section className="card page-card">
        <AppHeader title="Gallery" subtitle="Snapshots of interaction patterns across the experience." />
        <SiteNav />

        <section className="gallery-grid" aria-label="Feature gallery">
          {galleryItems.map((item, index) => (
            <EntranceAnimator key={item.title} delay={index * 0.05}>
              <article className="gallery-tile">
                <p className="gallery-index">0{index + 1}</p>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            </EntranceAnimator>
          ))}
        </section>
      </section>
    </main>
  );
}

export default GalleryPage;
