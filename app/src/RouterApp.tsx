import { AnimatePresence, LazyMotion, m } from "framer-motion";
import { type ReactElement, useEffect, useMemo, useRef } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import App from "./App";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import GalleryPage from "./pages/GalleryPage";
import HomePage from "./pages/HomePage";
import LetterPage from "./pages/LetterPage";
import StoryPage from "./pages/StoryPage";
import { useUiPreferences } from "./lib/uiPreferences";

type RouteTransitionProps = {
  children: ReactElement;
  direction: -1 | 0 | 1;
  motionEnabled: boolean;
};

function routeRank(pathname: string) {
  if (pathname.startsWith("/open/letter/")) {
    return 2;
  }

  if (pathname === "/open") {
    return 1;
  }

  if (pathname === "/" || pathname === "") {
    return 0;
  }

  return 1;
}

function RouteTransition({ children, direction, motionEnabled }: RouteTransitionProps) {
  if (!motionEnabled) {
    return <div className="route-transition">{children}</div>;
  }

  return (
    <m.div
      className="route-transition"
      custom={direction}
      variants={{
        initial: (value: number) => ({
          opacity: 0,
          y: 16,
          x: value === 0 ? 0 : value > 0 ? 38 : -38
        }),
        animate: {
          opacity: 1,
          x: 0,
          y: 0
        },
        exit: (value: number) => ({
          opacity: 0,
          y: -8,
          x: value === 0 ? 0 : value > 0 ? -24 : 24
        })
      }}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.34, ease: [0.2, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}

function RouterApp() {
  const location = useLocation();
  const { effectiveMotionEnabled } = useUiPreferences();
  const previousRankRef = useRef(routeRank(location.pathname));

  const direction = useMemo<0 | -1 | 1>(() => {
    const current = routeRank(location.pathname);
    const previous = previousRankRef.current;

    if (current === previous) {
      return 0;
    }

    return current > previous ? 1 : -1;
  }, [location.pathname]);

  useEffect(() => {
    previousRankRef.current = routeRank(location.pathname);
  }, [location.pathname]);

  return (
    <LazyMotion features={() => import("framer-motion").then((module) => module.domAnimation)} strict>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={<RouteTransition direction={direction} motionEnabled={effectiveMotionEnabled}><HomePage /></RouteTransition>}
          />
          <Route
            path="/open"
            element={<RouteTransition direction={direction} motionEnabled={effectiveMotionEnabled}><App /></RouteTransition>}
          />
          <Route
            path="/open/letter/:letterId"
            element={<RouteTransition direction={direction} motionEnabled={effectiveMotionEnabled}><LetterPage /></RouteTransition>}
          />
          <Route
            path="/story"
            element={<RouteTransition direction={direction} motionEnabled={effectiveMotionEnabled}><StoryPage /></RouteTransition>}
          />
          <Route
            path="/about"
            element={<RouteTransition direction={direction} motionEnabled={effectiveMotionEnabled}><AboutPage /></RouteTransition>}
          />
          <Route
            path="/gallery"
            element={<RouteTransition direction={direction} motionEnabled={effectiveMotionEnabled}><GalleryPage /></RouteTransition>}
          />
          <Route
            path="/contact"
            element={<RouteTransition direction={direction} motionEnabled={effectiveMotionEnabled}><ContactPage /></RouteTransition>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </LazyMotion>
  );
}

export default RouterApp;
