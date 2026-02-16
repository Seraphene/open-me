import { Suspense, lazy, useEffect, useState } from "react";
import { useUiPreferences } from "../../lib/uiPreferences";

const LazyLottie = lazy(async () => {
  const module = await import("lottie-react");
  return { default: module.default };
});

type AnimatedIconProps = {
  lottiePath?: string;
  label: string;
  size?: number;
  className?: string;
};

function AnimatedIcon({ lottiePath, label, size = 64, className }: AnimatedIconProps) {
  const { effectiveMotionEnabled } = useUiPreferences();
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    if (!lottiePath || !effectiveMotionEnabled) {
      setAnimationData(null);
      return;
    }

    let disposed = false;

    void fetch(lottiePath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load animation");
        }

        return response.json() as Promise<object>;
      })
      .then((json) => {
        if (!disposed) {
          setAnimationData(json);
        }
      })
      .catch(() => {
        if (!disposed) {
          setAnimationData(null);
        }
      });

    return () => {
      disposed = true;
    };
  }, [effectiveMotionEnabled, lottiePath]);

  if (animationData && effectiveMotionEnabled) {
    return (
      <div className={className} aria-label={label} title={label}>
        <Suspense
          fallback={
            <svg aria-label={label} role="img" viewBox="0 0 64 64" width={size} height={size} className={className}>
              <circle cx="32" cy="32" r="30" fill="var(--brand-100)" />
              <path
                d="M32 47c-7.7-5.3-15-10.4-15-18.3 0-4.4 3.4-7.8 7.7-7.8 2.8 0 5.4 1.5 7.3 3.8 2-2.3 4.6-3.8 7.4-3.8 4.2 0 7.6 3.4 7.6 7.8 0 7.9-7.3 13-15 18.3z"
                fill="var(--brand-500)"
              />
            </svg>
          }
        >
          <LazyLottie animationData={animationData} loop style={{ width: size, height: size }} />
        </Suspense>
      </div>
    );
  }

  return (
    <svg
      aria-label={label}
      role="img"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
    >
      <circle cx="32" cy="32" r="30" fill="var(--brand-100)" />
      <path
        d="M32 47c-7.7-5.3-15-10.4-15-18.3 0-4.4 3.4-7.8 7.7-7.8 2.8 0 5.4 1.5 7.3 3.8 2-2.3 4.6-3.8 7.4-3.8 4.2 0 7.6 3.4 7.6 7.8 0 7.9-7.3 13-15 18.3z"
        fill="var(--brand-500)"
      />
    </svg>
  );
}

export default AnimatedIcon;
