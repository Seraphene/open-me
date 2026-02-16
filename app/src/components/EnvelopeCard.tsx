import type { Letter } from "../features/envelopes";
import { lockLabel } from "../features/envelopes";

type EnvelopeCardProps = {
  letter: Letter;
  unlocked: boolean;
  onOpen: () => void;
};

function EnvelopeCard({ letter, unlocked, onOpen }: EnvelopeCardProps) {
  return (
    <article className={`envelope ${unlocked ? "" : "envelope--locked"}`}>
      <h3>{letter.title}</h3>
      <p className="preview">{letter.preview}</p>
      <p className="badge">{lockLabel(letter)}</p>
      <button type="button" onClick={onOpen}>
        {unlocked ? "Open letter" : "Try to open"}
      </button>
    </article>
  );
}

export default EnvelopeCard;
