import { useCartStore } from "../../features/gifts/cartStore";

type MiniCartWidgetProps = {
  visibleOnMobile: boolean;
  onCloseMobile: () => void;
};

function formatPrice(price: number) {
  return `₹${price.toLocaleString("en-IN")}`;
}

function MiniCartWidget({ visibleOnMobile, onCloseMobile }: MiniCartWidgetProps) {
  const { state, itemsDetailed, addToCart, removeFromCart } = useCartStore();

  return (
    <aside className={`mini-cart ${visibleOnMobile ? "mini-cart--mobile-open" : ""}`} aria-label="Cart and profile widget">
      <header className="mini-cart__header">
        <img
          className="mini-cart__avatar"
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=70"
          alt="Profile avatar"
        />
        <div>
          <p className="mini-cart__name">Riya Kapoor</p>
          <p className="mini-cart__location">{state.user_location}</p>
        </div>
        <button type="button" className="mini-cart__mobile-close" onClick={onCloseMobile} aria-label="Close cart panel">
          ×
        </button>
      </header>

      <div className="mini-cart__items" aria-label="Cart list">
        {itemsDetailed.map((entry) => (
          <article className="mini-cart__item" key={entry.product.id}>
            <img src={entry.product.image_url} alt={entry.product.name} />
            <div>
              <h4>{entry.product.name}</h4>
              <p>{formatPrice(entry.subtotal)}</p>
            </div>
            <div className="mini-cart__qty">
              <button type="button" onClick={() => removeFromCart(entry.product.id)} aria-label="Decrease quantity">
                −
              </button>
              <span>{entry.qty}</span>
              <button type="button" onClick={() => addToCart(entry.product.id)} aria-label="Increase quantity">
                +
              </button>
            </div>
          </article>
        ))}
      </div>

      <footer className="mini-cart__footer">
        <p>Total</p>
        <strong>{formatPrice(state.total_value)}</strong>
        <button type="button" className="gift-primary-button">
          Buy Now
        </button>
      </footer>
    </aside>
  );
}

export default MiniCartWidget;
