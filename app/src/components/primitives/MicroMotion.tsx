import { m } from "framer-motion";
import { type ReactNode } from "react";
import { useUiPreferences } from "../../lib/uiPreferences";

type MicroMotionProps = {
  children: ReactNode;
  className?: string;
};

function MicroMotion({ children, className }: MicroMotionProps) {
  const { effectiveMotionEnabled } = useUiPreferences();

  return (
    <m.div
      className={className}
      whileHover={effectiveMotionEnabled ? { y: -4, scale: 1.03 } : undefined}
      whileTap={effectiveMotionEnabled ? { scale: 0.98 } : undefined}
      transition={effectiveMotionEnabled ? { duration: 0.16, ease: [0.2, 1, 0.3, 1] } : undefined}
    >
      {children}
    </m.div>
  );
}

export default MicroMotion;
