import { m } from "framer-motion";
import { type ReactNode } from "react";
import { useUiPreferences } from "../../lib/uiPreferences";

type EntranceAnimatorProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

function EntranceAnimator({ children, className, delay = 0 }: EntranceAnimatorProps) {
  const { effectiveMotionEnabled } = useUiPreferences();

  if (!effectiveMotionEnabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.35, delay, ease: [0.2, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}

export default EntranceAnimator;
