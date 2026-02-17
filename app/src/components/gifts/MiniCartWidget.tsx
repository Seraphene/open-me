import type { Letter } from "../../features/envelopes";

type MiniCartWidgetProps = {
  visibleOnMobile: boolean;
  onCloseMobile: () => void;
  selectedLetters: Letter[];
  onRemove: (letterId: string) => void;
  onOpenLetter: (letterId: string) => void;
};

function MiniCartWidget({
  visibleOnMobile,
  onCloseMobile,
  selectedLetters,
  onRemove,
  onOpenLetter
}: MiniCartWidgetProps) {

  return (
    <aside className={`mini-cart ${visibleOnMobile ? "mini-cart--mobile-open" : ""}`} aria-label="Profile and saved letters widget">
      <header className="mini-cart__header">
        <img
          className="mini-cart__avatar"
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=70"
          alt="Profile avatar"
        />
        <div>
          <p className="mini-cart__name">Open Me Reader</p>
          <p className="mini-cart__location">Private memory archive</p>
        </div>
        <button type="button" className="mini-cart__mobile-close" onClick={onCloseMobile} aria-label="Close cart panel">
          ×
        </button>
      </header>

      <div className="mini-cart__items" aria-label="Saved letters list">
        {selectedLetters.map((letter) => (
          <article className="mini-cart__item" key={letter.id}>
            <img
              src={
                letter.media?.find((media) => media.kind === "image")?.src ??
                "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=900&q=70"
              }
              alt={letter.title}
            />
            <div>
              <h4>{letter.title}</h4>
              <p>{letter.preview}</p>
            </div>
            <div className="mini-cart__qty">
              <button type="button" onClick={() => onRemove(letter.id)} aria-label="Remove letter">
                ×
              </button>
              <button type="button" onClick={() => onOpenLetter(letter.id)} aria-label="Open letter">
                ↗
              </button>
            </div>
          </article>
        ))}
      </div>

      <footer className="mini-cart__footer">
        <p>Saved letters</p>
        <strong>{selectedLetters.length}</strong>
        <button
          type="button"
          className="gift-primary-button"
          onClick={() => {
            if (selectedLetters[0]) {
              onOpenLetter(selectedLetters[0].id);
            }
          }}
          disabled={!selectedLetters.length}
        >
          Open First
        </button>
      </footer>
    </aside>
  );
}

export default MiniCartWidget;
