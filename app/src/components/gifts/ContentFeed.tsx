import type { Product } from "../../features/gifts/products";

type ContentFeedProps = {
  selectedCategory: "all" | "cakes" | "flowers" | "hampers";
  onSelectCategory: (category: "all" | "cakes" | "flowers" | "hampers") => void;
  products: Product[];
  currencyLabel: string;
  onAdd: (productId: string) => void;
};

const categories: Array<{ key: "all" | "cakes" | "flowers" | "hampers"; label: string }> = [
  { key: "all", label: "All" },
  { key: "cakes", label: "Cakes" },
  { key: "flowers", label: "Flowers" },
  { key: "hampers", label: "Hampers" }
];

function formatPrice(currency: string, price: number) {
  if (currency === "INR") {
    return `₹${price.toLocaleString("en-IN")}`;
  }

  return `$${price.toLocaleString("en-US")}`;
}

function ContentFeed({ selectedCategory, onSelectCategory, products, currencyLabel, onAdd }: ContentFeedProps) {
  const bestsellers = products.filter((product) => product.is_bestseller);

  return (
    <section className="gift-feed" aria-label="Gift feed">
      <header className="gift-feed__header">
        <h1>Gift Explorer</h1>
        <p>{currencyLabel}</p>
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

      <article className="gift-promo-banner" aria-label="Friendship Day Offer">
        <p className="gift-promo-banner__script">Friendship Day</p>
        <h2>Offer up to 30% on curated gift bundles</h2>
      </article>

      <section className="gift-grid-wrap" aria-label="Bestsellers">
        <div className="gift-grid-head">
          <h3>Bestsellers</h3>
          <span>{bestsellers.length} items</span>
        </div>
        <div className="gift-grid">
          {bestsellers.map((product) => (
            <article className="gift-product-card" key={product.id}>
              <img src={product.image_url} alt={product.name} loading="lazy" />
              <h4>{product.name}</h4>
              <p>{formatPrice(product.currency, product.price)}</p>
              <button type="button" className="gift-secondary-button" onClick={() => onAdd(product.id)}>
                Add
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

export default ContentFeed;
