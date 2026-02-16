import type { Letter } from "../features/envelopes";
import { lockLabel } from "../features/envelopes";
import MicroMotion from "./primitives/MicroMotion";

type EnvelopeCardProps = {
  letter: Letter;
  unlocked: boolean;
  statusNote?: string;
  actionDisabled?: boolean;
  onOpen: () => void;
};

function EnvelopeCard({ letter, unlocked, statusNote, actionDisabled, onOpen }: EnvelopeCardProps) {
  return (
    <MicroMotion>
      <article className={`envelope ${unlocked ? "" : "envelope--locked"}`}>
        <h3>{letter.title}</h3>
        <p className="preview">{letter.preview}</p>
        <p className="badge">{lockLabel(letter)}</p>
        {statusNote ? <p className="envelope-note">{statusNote}</p> : null}
        <button type="button" onClick={onOpen} disabled={actionDisabled}>
          {unlocked ? "Open letter" : "Locked"}
        </button>
      </article>
    </MicroMotion>
  );
}

export default EnvelopeCard;
