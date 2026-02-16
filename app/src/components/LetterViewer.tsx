import type { Letter } from "../features/envelopes";

type LetterViewerProps = {
  letter: Letter;
  onClose: () => void;
  onEmergencySupport: () => void;
  emergencyBusy: boolean;
  emergencyMessage: string | null;
};

function LetterViewer({ letter, onClose, onEmergencySupport, emergencyBusy, emergencyMessage }: LetterViewerProps) {
  return (
    <div className="viewer-overlay" onClick={onClose}>
      <section
        className="viewer"
        role="dialog"
        aria-modal="true"
        aria-label={letter.title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="viewer-header">
          <h2>{letter.title}</h2>
          <div className="viewer-actions">
            <button type="button" className="emergency-button" onClick={onEmergencySupport} disabled={emergencyBusy}>
              {emergencyBusy ? "Sending..." : "Emergency support"}
            </button>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </header>

        {emergencyMessage ? <p className="viewer-message">{emergencyMessage}</p> : null}

        <p>{letter.content}</p>

        <div className="media-grid">
          {letter.media?.map((media, index) => {
            if (media.kind === "image") {
              return <img key={`${letter.id}-${index}`} src={media.src} alt={media.alt ?? "Letter memory"} />;
            }

            if (media.kind === "audio") {
              return (
                <audio key={`${letter.id}-${index}`} controls preload="none">
                  <source src={media.src} />
                </audio>
              );
            }

            return (
              <video key={`${letter.id}-${index}`} controls preload="none" width={320}>
                <source src={media.src} />
              </video>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default LetterViewer;
