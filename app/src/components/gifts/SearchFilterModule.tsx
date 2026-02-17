export type Region = "india" | "international";
export type Occasion = "all" | "birthday" | "anniversary" | "valentine" | "friendship";
export type GiftType = "all" | "cakes" | "flowers" | "hampers";

type SearchFilterModuleProps = {
  region: Region;
  occasion: Occasion;
  giftType: GiftType;
  onRegionChange: (region: Region) => void;
  onOccasionChange: (occasion: Occasion) => void;
  onGiftTypeChange: (type: GiftType) => void;
  onSubmit: () => void;
};

function SearchFilterModule({
  region,
  occasion,
  giftType,
  onRegionChange,
  onOccasionChange,
  onGiftTypeChange,
  onSubmit
}: SearchFilterModuleProps) {
  return (
    <section className="gift-search" aria-label="Search and filter">
      <div className="gift-region-toggle" role="tablist" aria-label="Region">
        <button
          type="button"
          role="tab"
          aria-selected={region === "india"}
          className={region === "india" ? "is-active" : ""}
          onClick={() => onRegionChange("india")}
        >
          India
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={region === "international"}
          className={region === "international" ? "is-active" : ""}
          onClick={() => onRegionChange("international")}
        >
          International
        </button>
      </div>

      <div className="gift-input-group">
        <label>
          Occasion
          <select value={occasion} onChange={(event) => onOccasionChange(event.target.value as Occasion)}>
            <option value="all">All</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="valentine">Valentine</option>
            <option value="friendship">Friendship</option>
          </select>
        </label>
        <label>
          Gift type
          <select value={giftType} onChange={(event) => onGiftTypeChange(event.target.value as GiftType)}>
            <option value="all">All</option>
            <option value="cakes">Cakes</option>
            <option value="flowers">Flowers</option>
            <option value="hampers">Hampers</option>
          </select>
        </label>
        <button type="button" className="gift-primary-button" onClick={onSubmit}>
          Find Gifts
        </button>
      </div>
    </section>
  );
}

export default SearchFilterModule;
