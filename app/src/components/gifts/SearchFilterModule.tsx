export type Region = "all" | "unlockable";
export type Occasion = "all" | "honor" | "time";
export type GiftType = "all" | "image" | "audio" | "video";

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
      <div className="gift-region-toggle" role="tablist" aria-label="View mode">
        <button
          type="button"
          role="tab"
          aria-selected={region === "all"}
          className={region === "all" ? "is-active" : ""}
          onClick={() => onRegionChange("all")}
        >
          All letters
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={region === "unlockable"}
          className={region === "unlockable" ? "is-active" : ""}
          onClick={() => onRegionChange("unlockable")}
        >
          Unlockable now
        </button>
      </div>

      <div className="gift-input-group">
        <label>
          Lock type
          <select value={occasion} onChange={(event) => onOccasionChange(event.target.value as Occasion)}>
            <option value="all">All</option>
            <option value="honor">Honor lock</option>
            <option value="time">Time lock</option>
          </select>
        </label>
        <label>
          Media kind
          <select value={giftType} onChange={(event) => onGiftTypeChange(event.target.value as GiftType)}>
            <option value="all">All</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
          </select>
        </label>
        <button type="button" className="gift-primary-button" onClick={onSubmit}>
          Find Letters
        </button>
      </div>
    </section>
  );
}

export default SearchFilterModule;
