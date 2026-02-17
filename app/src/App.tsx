import { useMemo, useRef, useState } from "react";
import ContentFeed from "./components/gifts/ContentFeed";
import MiniCartWidget from "./components/gifts/MiniCartWidget";
import SearchFilterModule, {
  type GiftType,
  type Occasion,
  type Region
} from "./components/gifts/SearchFilterModule";
import SidebarNav from "./components/gifts/SidebarNav";
import { CartProvider, useCartStore } from "./features/gifts/cartStore";
import { products } from "./features/gifts/products";

function GiftDashboard() {
  const { addToCart } = useCartStore();
  const [activeNav, setActiveNav] = useState<"home" | "categories" | "settings">("home");
  const [region, setRegion] = useState<Region>("india");
  const [occasionDraft, setOccasionDraft] = useState<Occasion>("all");
  const [giftTypeDraft, setGiftTypeDraft] = useState<GiftType>("all");
  const [occasion, setOccasion] = useState<Occasion>("all");
  const [giftType, setGiftType] = useState<GiftType>("all");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "cakes" | "flowers" | "hampers">("all");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const homeRef = useRef<HTMLElement | null>(null);
  const categoriesRef = useRef<HTMLElement | null>(null);
  const settingsRef = useRef<HTMLElement | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const regionMatch = region === "international" || product.currency === "INR";
      const occasionMatch = occasion === "all" || product.occasion_tags.includes(occasion);
      const typeMatch = giftType === "all" || product.category === giftType;
      const categoryMatch = selectedCategory === "all" || product.category === selectedCategory;

      return regionMatch && occasionMatch && typeMatch && categoryMatch;
    });
  }, [region, occasion, giftType, selectedCategory]);

  const handleSidebarSelect = (key: "home" | "categories" | "settings") => {
    setActiveNav(key);

    if (key === "home") {
      homeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    if (key === "categories") {
      categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="gift-page">
      <section className="gift-layout" aria-label="Gift dashboard layout">
        <SidebarNav active={activeNav} onSelect={handleSidebarSelect} />

        <section className="gift-main-canvas">
          <section ref={homeRef}>
            <SearchFilterModule
              region={region}
              occasion={occasionDraft}
              giftType={giftTypeDraft}
              onRegionChange={setRegion}
              onOccasionChange={setOccasionDraft}
              onGiftTypeChange={setGiftTypeDraft}
              onSubmit={() => {
                setOccasion(occasionDraft);
                setGiftType(giftTypeDraft);
              }}
            />
          </section>

          <section ref={categoriesRef}>
            <ContentFeed
              selectedCategory={selectedCategory}
              onSelectCategory={(category) => {
                setActiveNav("categories");
                setSelectedCategory(category);
              }}
              products={filteredProducts}
              currencyLabel={region === "india" ? "Prices in INR" : "International catalog"}
              onAdd={(productId) => {
                addToCart(productId);
                setMobileCartOpen(true);
              }}
            />
          </section>
        </section>

        <section ref={settingsRef}>
          <MiniCartWidget visibleOnMobile={mobileCartOpen} onCloseMobile={() => setMobileCartOpen(false)} />
        </section>
      </section>

      <button
        type="button"
        className="gift-mobile-cart-button"
        onClick={() => setMobileCartOpen((previous) => !previous)}
      >
        Cart
      </button>

      {mobileCartOpen ? (
        <button
          type="button"
          className="gift-mobile-backdrop"
          aria-label="Close cart panel"
          onClick={() => setMobileCartOpen(false)}
        />
      ) : null}
    </main>
  );
}

function App() {
  return (
    <CartProvider>
      <GiftDashboard />
    </CartProvider>
  );
}

export default App;
