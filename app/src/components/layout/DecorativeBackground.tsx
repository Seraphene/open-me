import { m } from "framer-motion";
import { useUiPreferences } from "../../lib/uiPreferences";

function DecorativeBackground() {
  const { effectiveMotionEnabled } = useUiPreferences();

  return (
    <div className="decorative-bg" aria-hidden="true">
      <m.span
        className="blob blob-a"
        animate={effectiveMotionEnabled ? { y: [0, -12, 0], x: [0, 8, 0] } : undefined}
        transition={effectiveMotionEnabled ? { repeat: Infinity, duration: 9, ease: "easeInOut" } : undefined}
      />
      <m.span
        className="blob blob-b"
        animate={effectiveMotionEnabled ? { y: [0, 10, 0], x: [0, -10, 0] } : undefined}
        transition={effectiveMotionEnabled ? { repeat: Infinity, duration: 11, ease: "easeInOut" } : undefined}
      />
      <m.span
        className="blob blob-c"
        animate={effectiveMotionEnabled ? { y: [0, -8, 0], x: [0, -6, 0] } : undefined}
        transition={effectiveMotionEnabled ? { repeat: Infinity, duration: 8, ease: "easeInOut" } : undefined}
      />
    </div>
  );
}

export default DecorativeBackground;
