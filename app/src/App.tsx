import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContentFeed from "./components/gifts/ContentFeed";
import MiniCartWidget from "./components/gifts/MiniCartWidget";
import SearchFilterModule, {
  type GiftType,
  type Occasion,
  type Region
} from "./components/gifts/SearchFilterModule";
import SidebarNav from "./components/gifts/SidebarNav";
import { isUnlocked, seedLetters, type Letter } from "./features/envelopes";

type LetterListResponse = {
  letters?: Letter[];
};

async function fetchLetters() {
  const response = await fetch("/api/letter-list", {
    method: "GET"
  });

  if (!response.ok) {
    throw new Error("Failed to load letters.");
  }

  const body = (await response.json()) as LetterListResponse;
  if (!Array.isArray(body.letters)) {
    throw new Error("Invalid letter list response.");
  }

  return body.letters;
}

function GiftDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState<"home" | "categories" | "settings">("home");
  const [region, setRegion] = useState<Region>("all");
  const [occasionDraft, setOccasionDraft] = useState<Occasion>("all");
  const [giftTypeDraft, setGiftTypeDraft] = useState<GiftType>("all");
  const [occasion, setOccasion] = useState<Occasion>("all");
  const [giftType, setGiftType] = useState<GiftType>("all");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "honor" | "time">("all");
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [letters, setLetters] = useState<Letter[]>(seedLetters);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const homeRef = useRef<HTMLElement | null>(null);
  const categoriesRef = useRef<HTMLElement | null>(null);
  const settingsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await fetchLetters();
        setLetters(loaded);
      } catch {
        setLetters(seedLetters);
      }
    };

    void load();
  }, []);

  const filteredLetters = useMemo(() => {
    return letters.filter((letter) => {
      const primaryMedia = letter.media?.[0]?.kind;
      const regionMatch = region === "all" || (region === "unlockable" ? isUnlocked(letter) : true);
      const occasionMatch = occasion === "all" || letter.lockType === occasion;
      const typeMatch = giftType === "all" || primaryMedia === giftType;
      const categoryMatch = selectedCategory === "all" || letter.lockType === selectedCategory;

      return regionMatch && occasionMatch && typeMatch && categoryMatch;
    });
  }, [letters, region, occasion, giftType, selectedCategory]);

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
              items={filteredLetters}
              statusLabel={region === "unlockable" ? "Showing unlockable letters" : "Showing all letters"}
              onAdd={(letterId) => {
                setSelectedLetters((previous) =>
                  previous.includes(letterId) ? previous : [...previous, letterId]
                );
                setMobileCartOpen(true);
              }}
              onOpen={(letterId) => {
                navigate(`/open/letter/${letterId}`);
              }}
            />
          </section>
        </section>

        <section ref={settingsRef}>
          <MiniCartWidget
            visibleOnMobile={mobileCartOpen}
            onCloseMobile={() => setMobileCartOpen(false)}
            selectedLetters={selectedLetters
              .map((letterId) => letters.find((entry) => entry.id === letterId))
              .filter((entry): entry is Letter => Boolean(entry))}
            onRemove={(letterId) => {
              setSelectedLetters((previous) => previous.filter((entry) => entry !== letterId));
            }}
            onOpenLetter={(letterId) => {
              navigate(`/open/letter/${letterId}`);
            }}
          />
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
  return <GiftDashboard />;
}

export default App;
