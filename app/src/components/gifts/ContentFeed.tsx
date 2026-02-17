import { lockLabel, type Letter } from "../../features/envelopes";

type ContentFeedProps = {
  selectedCategory: "all" | "honor" | "time";
  onSelectCategory: (category: "all" | "honor" | "time") => void;
  items: Letter[];
  statusLabel: string;
  onAdd: (letterId: string) => void;
  onOpen: (letterId: string) => void;
};

const categories: Array<{ key: "all" | "honor" | "time"; label: string }> = [
  { key: "all", label: "All" },
  { key: "honor", label: "Honor lock" },
  { key: "time", label: "Time lock" }
];

function mediaBadge(letter: Letter) {
  const media = letter.media?.[0]?.kind;
  if (!media) {
    return "No media";
  }

  return media.charAt(0).toUpperCase() + media.slice(1);
}

function ContentFeed({ selectedCategory, onSelectCategory, items, statusLabel, onAdd, onOpen }: ContentFeedProps) {
  const featured = items.slice(0, 8);

  return (
    <section className="gift-feed" aria-label="Letter feed">
      <header className="gift-feed__header">
        <h1>Open Me Letters</h1>
        <p>{statusLabel}</p>
      </header>

      <div className="gift-category-rail" role="tablist" aria-label="Categories">
        {categories.map((category) => (
          <button
            key={category.key}
            type="button"
            className={selectedCategory === category.key ? "is-active" : ""}
            onClick={() => onSelectCategory(category.key)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <article className="gift-promo-banner" aria-label="Memory archive">
        <p className="gift-promo-banner__script">Open Me</p>
        <h2>Private letters, timed moments, and meaningful memories in one place</h2>
      </article>

      <section className="gift-grid-wrap" aria-label="Letters">
        <div className="gift-grid-head">
          <h3>Letters</h3>
          <span>{featured.length} items</span>
        </div>
        <div className="gift-grid">
          {featured.map((letter) => {
            const previewImage =
              letter.media?.find((media) => media.kind === "image")?.src ??
              "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=900&q=70";

            return (
              <article className="gift-product-card" key={letter.id}>
                <img src={previewImage} alt={letter.title} loading="lazy" />
                <h4>{letter.title}</h4>
                <p>{lockLabel(letter)}</p>
                <small>{mediaBadge(letter)}</small>
                <div className="gift-card-actions">
                  <button type="button" className="gift-secondary-button" onClick={() => onAdd(letter.id)}>
                    Save
                  </button>
                  <button type="button" className="gift-primary-button" onClick={() => onOpen(letter.id)}>
                    Open
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

export default ContentFeed;
