import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LazyMotion } from "framer-motion";
import EnvelopeCard from "./components/EnvelopeCard";
import LetterViewer from "./components/LetterViewer";
import AppHeader from "./components/layout/AppHeader";
import DecorativeBackground from "./components/layout/DecorativeBackground";
import SiteNav from "./components/layout/SiteNav";
import AnimatedIcon from "./components/primitives/AnimatedIcon";
import EntranceAnimator from "./components/primitives/EntranceAnimator";
import { isUnlocked, lockCountdownLabel, seedLetters, type Letter } from "./features/envelopes";
import {
  GoogleAuthProvider,
  User,
  getAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut
} from "firebase/auth";
import {
  getFirebaseApp,
  getFirebaseInitStatus
} from "./lib/firebase";
import {
  clearOfflineQueue,
  flushOfflineEventQueue,
  getOfflineQueueSize,
  offlineQueueChangedEventName,
  postEventWithOfflineQueue
} from "./lib/offlineQueue";

const emailStorageKey = "openme.emailForSignIn";
const honorLockStorageKey = "openme.honorLockConfirmations";
const lettersCacheStorageKey = "openme.cachedLetters";

type AuthUser = Pick<User, "uid" | "email" | "displayName">;

type LetterOpenEventPayload = {
  letterId: string;
  openedAt: string;
  lockType: "honor" | "time";
  unlocked: boolean;
  userId?: string;
};

type ReadReceiptPayload = {
  letterId: string;
  openedAt: string;
  recipientId?: string;
  deviceType: "mobile" | "desktop" | "tablet" | "unknown";
};

type EmergencySupportPayload = {
  message: string;
  recipientEmail?: string;
  context?: string;
};

type LetterUpdatePayload = {
  id: string;
  title: string;
  preview: string;
  content: string;
  lockType: "honor" | "time";
  unlockAt?: string;
  media?: Array<{
    kind: "image" | "audio" | "video";
    src: string;
    alt?: string;
  }>;
};

type CmsLetterForm = {
  id: string;
  title: string;
  preview: string;
  content: string;
  lockType: "honor" | "time";
  unlockAt: string;
  mediaKind: "image" | "audio" | "video";
  mediaSrc: string;
  mediaAlt: string;
};

type LetterListResponse = {
  letters?: Letter[];
};

type LetterUpdateResponse = {
  error?: string;
  letter?: Letter;
};

async function postLetterOpenEvent(payload: LetterOpenEventPayload) {
  await postEventWithOfflineQueue({
    endpoint: "/api/letter-open",
    payload
  });
}

async function postReadReceipt(payload: ReadReceiptPayload) {
  await postEventWithOfflineQueue({
    endpoint: "/api/read-receipt",
    payload
  });
}

async function postEmergencySupport(payload: EmergencySupportPayload) {
  const response = await fetch("/api/emergency-notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const body = (await response.json()) as { message?: string };

  if (!response.ok) {
    throw new Error(body.message ?? "Emergency support request failed.");
  }
}

async function fetchLetters() {
  const response = await fetch("/api/letter-list", {
    method: "GET"
  });

  if (!response.ok) {
    throw new Error("Failed to load letters.");
  }

  const body = (await response.json()) as LetterListResponse;
  if (!Array.isArray(body.letters)) {
    throw new Error("Invalid letter list response.");
  }

  return body.letters;
}

async function updateLetter(payload: LetterUpdatePayload, adminToken: string, actorId: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-admin-token": adminToken
  };

  headers["x-actor-id"] = actorId.trim();

  const response = await fetch("/api/letter-update", {
    method: "POST",
    headers,
    body: JSON.stringify(payload)
  });

  const body = (await response.json()) as LetterUpdateResponse;
  if (!response.ok) {
    throw new Error(body.error ?? "Failed to save letter.");
  }

  if (!body.letter) {
    throw new Error("Invalid response from letter update.");
  }

  return body.letter;
}

function letterToForm(letter: Letter): CmsLetterForm {
  const firstMedia = letter.media?.[0];

  return {
    id: letter.id,
    title: letter.title,
    preview: letter.preview,
    content: letter.content,
    lockType: letter.lockType,
    unlockAt: letter.unlockAt ?? "",
    mediaKind: firstMedia?.kind ?? "image",
    mediaSrc: firstMedia?.src ?? "",
    mediaAlt: firstMedia?.alt ?? ""
  };
}

function createEmptyLetterForm(): CmsLetterForm {
  return {
    id: "",
    title: "",
    preview: "",
    content: "",
    lockType: "honor",
    unlockAt: "",
    mediaKind: "image",
    mediaSrc: "",
    mediaAlt: ""
  };
}

function detectDeviceType(): "mobile" | "desktop" | "tablet" | "unknown" {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  const userAgent = navigator.userAgent.toLowerCase();

  if (/ipad|tablet/.test(userAgent)) {
    return "tablet";
  }

  if (/mobi|android|iphone/.test(userAgent)) {
    return "mobile";
  }

  return "desktop";
}

function requireAuth() {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase is not configured.");
  }

  return getAuth(app);
}

function onAuthUserChanged(callback: (user: AuthUser | null) => void) {
  const auth = requireAuth();

  return onAuthStateChanged(auth, (user) => {
    callback(
      user
        ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          }
        : null
    );
  });
}

async function signInWithGoogle() {
  const auth = requireAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });

  await signInWithPopup(auth, provider);
}

async function sendEmailSignInLink(email: string) {
  const auth = requireAuth();

  await sendSignInLinkToEmail(auth, email, {
    url: window.location.origin,
    handleCodeInApp: true
  });

  window.localStorage.setItem(emailStorageKey, email);
}

async function completeEmailLinkSignIn() {
  const auth = requireAuth();
  const href = window.location.href;

  if (!isSignInWithEmailLink(auth, href)) {
    return false;
  }

  const rememberedEmail = window.localStorage.getItem(emailStorageKey);
  const email = rememberedEmail ?? window.prompt("Confirm your email to complete sign-in") ?? "";

  if (!email.trim()) {
    throw new Error("Email is required to complete sign-in.");
  }

  await signInWithEmailLink(auth, email, href);
  window.localStorage.removeItem(emailStorageKey);
  return true;
}

async function signOutCurrentUser() {
  const auth = requireAuth();
  await signOut(auth);
}

function App() {
  const [letters, setLetters] = useState<Letter[]>(seedLetters);
  const [lettersBusy, setLettersBusy] = useState(true);
  const [lettersRefreshing, setLettersRefreshing] = useState(false);
  const [lettersMessage, setLettersMessage] = useState<string | null>(null);
  const [lettersLastSyncedAt, setLettersLastSyncedAt] = useState<string | null>(null);
  const [pendingOfflineEvents, setPendingOfflineEvents] = useState(0);
  const [swUpdateReady, setSwUpdateReady] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [confirmedHonorLocks, setConfirmedHonorLocks] = useState<Record<string, boolean>>({});
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [cmsAdminToken, setCmsAdminToken] = useState("");
  const [cmsForm, setCmsForm] = useState<CmsLetterForm>(() => letterToForm(seedLetters[0]));
  const [cmsBusy, setCmsBusy] = useState(false);
  const [cmsMessage, setCmsMessage] = useState<string | null>(null);
  const [emergencyBusy, setEmergencyBusy] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const firebaseStatus = getFirebaseInitStatus();

  const loadLetters = async (options?: { background?: boolean }) => {
    const background = Boolean(options?.background);

    if (background) {
      setLettersRefreshing(true);
    } else {
      setLettersBusy(true);
    }

    setLettersMessage(null);
    try {
      const loadedLetters = await fetchLetters();
      setLetters(loadedLetters);
      setLettersLastSyncedAt(new Date().toISOString());
    } catch {
      const cachedLettersRaw = window.localStorage.getItem(lettersCacheStorageKey);
      if (cachedLettersRaw) {
        try {
          const parsed = JSON.parse(cachedLettersRaw) as Letter[];
          if (Array.isArray(parsed) && parsed.length) {
            setLetters(parsed);
            setLettersMessage("Offline mode: showing cached letters.");
            return;
          }
        } catch {
          setLettersMessage("Could not parse cached letters. Falling back to defaults.");
        }
      }

      if (!background) {
        setLetters(seedLetters);
      }

      setLettersMessage("Could not sync latest letters. Showing local default letters.");
    } finally {
      if (background) {
        setLettersRefreshing(false);
      } else {
        setLettersBusy(false);
      }
    }
  };

  useEffect(() => {
    void loadLetters();
  }, []);

  useEffect(() => {
    const saved = window.localStorage.getItem(honorLockStorageKey);
    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as Record<string, boolean>;
      setConfirmedHonorLocks(parsed);
    } catch {
      window.localStorage.removeItem(honorLockStorageKey);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(honorLockStorageKey, JSON.stringify(confirmedHonorLocks));
  }, [confirmedHonorLocks]);

  useEffect(() => {
    setPendingOfflineEvents(getOfflineQueueSize());

    const onQueueChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ count?: number }>;
      setPendingOfflineEvents(customEvent.detail?.count ?? getOfflineQueueSize());
    };

    window.addEventListener(offlineQueueChangedEventName, onQueueChanged as EventListener);
    return () => {
      window.removeEventListener(offlineQueueChangedEventName, onQueueChanged as EventListener);
    };
  }, []);

  useEffect(() => {
    const onUpdateReady = () => {
      setSwUpdateReady(true);
    };

    window.addEventListener("openme:sw-update-ready", onUpdateReady);
    return () => {
      window.removeEventListener("openme:sw-update-ready", onUpdateReady);
    };
  }, []);

  useEffect(() => {
    if (!letters.length) {
      return;
    }

    window.localStorage.setItem(lettersCacheStorageKey, JSON.stringify(letters));
  }, [letters]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthUserChanged((user: AuthUser | null) => {
      setAuthUser(user);
    });

    void completeEmailLinkSignIn().then((signedIn: boolean) => {
      if (signedIn) {
        setAuthMessage("Email link sign-in complete.");
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const setOnline = () => setIsOnline(true);
    const setOffline = () => setIsOnline(false);

    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);

    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  useEffect(() => {
    void flushOfflineEventQueue();
  }, []);

  useEffect(() => {
    if (isOnline) {
      void flushOfflineEventQueue();
    }
  }, [isOnline]);

  useEffect(() => {
    if (!activeLetterId) {
      return;
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveLetterId(null);
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  }, [activeLetterId]);

  useEffect(() => {
    if (!activeLetterId) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeLetterId]);

  useEffect(() => {
    if (!letters.length) {
      return;
    }

    setCmsForm((previous: CmsLetterForm) => {
      const sameLetter = letters.find((letter) => letter.id === previous.id);
      if (sameLetter) {
        return letterToForm(sameLetter);
      }

      return letterToForm(letters[0]);
    });
  }, [letters]);

  const activeLetter = useMemo(
    () => letters.find((letter) => letter.id === activeLetterId) ?? null,
    [activeLetterId, letters]
  );

  const cmsSelectedLetter = useMemo(
    () => letters.find((letter) => letter.id === cmsForm.id) ?? null,
    [letters, cmsForm.id]
  );

  const openLetter = (letterId: string) => {
    const letter = letters.find((item) => item.id === letterId);
    if (!letter) {
      return;
    }

    if (letter.lockType === "honor" && !confirmedHonorLocks[letterId]) {
      const accepted = window.confirm("Are you sure you're ready to open this letter?");
      if (!accepted) {
        return;
      }

      setConfirmedHonorLocks((previous: Record<string, boolean>) => ({
        ...previous,
        [letterId]: true
      }));
    }

    const unlocked = letter.lockType === "honor" ? true : isUnlocked(letter);

    if (!unlocked) {
      window.alert("This envelope is still locked.");
      return;
    }

    void postLetterOpenEvent({
      letterId: letter.id,
      openedAt: new Date().toISOString(),
      lockType: letter.lockType,
      unlocked: true,
      userId: authUser?.uid
    });

    void postReadReceipt({
      letterId: letter.id,
      openedAt: new Date().toISOString(),
      recipientId: authUser?.uid,
      deviceType: detectDeviceType()
    });

    setEmergencyMessage(null);

    setActiveLetterId(letter.id);
  };

  const handleEmergencySupport = async () => {
    if (!activeLetter) {
      return;
    }

    setEmergencyBusy(true);
    setEmergencyMessage(null);
    try {
      await postEmergencySupport({
        message: `Emergency support requested while reading letter: ${activeLetter.title}`,
        recipientEmail: authUser?.email ?? undefined,
        context: `letterId=${activeLetter.id}; lockType=${activeLetter.lockType}`
      });
      setEmergencyMessage("Emergency support request sent.");
    } catch (error) {
      setEmergencyMessage(error instanceof Error ? error.message : "Emergency support request failed.");
    } finally {
      setEmergencyBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthBusy(true);
    setAuthMessage(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Google sign-in failed.");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleEmailLink = async () => {
    if (!emailInput.trim()) {
      setAuthMessage("Enter your email first.");
      return;
    }

    setAuthBusy(true);
    setAuthMessage(null);
    try {
      await sendEmailSignInLink(emailInput.trim());
      setAuthMessage("Sign-in link sent. Check your inbox.");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Email link sign-in failed.");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setAuthBusy(true);
    setAuthMessage(null);
    try {
      await signOutCurrentUser();
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Sign out failed.");
    } finally {
      setAuthBusy(false);
    }
  };

  const handleCmsSave = async () => {
    if (!authUser?.uid) {
      setCmsMessage("Sign in first to save CMS updates.");
      return;
    }

    if (!cmsAdminToken.trim()) {
      setCmsMessage("Enter CMS admin token to save updates.");
      return;
    }

    if (!cmsForm.id.trim() || !cmsForm.title.trim() || !cmsForm.preview.trim() || !cmsForm.content.trim()) {
      setCmsMessage("id, title, preview, and content are required.");
      return;
    }

    if (!/^[a-z0-9-]+$/i.test(cmsForm.id.trim())) {
      setCmsMessage("id may only include letters, numbers, and hyphens.");
      return;
    }

    if (cmsForm.lockType === "time" && !cmsForm.unlockAt.trim()) {
      setCmsMessage("unlockAt is required for time lock.");
      return;
    }

    setCmsBusy(true);
    setCmsMessage(null);

    try {
      const savedLetter = await updateLetter(
        {
          id: cmsForm.id.trim(),
          title: cmsForm.title.trim(),
          preview: cmsForm.preview.trim(),
          content: cmsForm.content.trim(),
          lockType: cmsForm.lockType,
          unlockAt: cmsForm.lockType === "time" ? cmsForm.unlockAt.trim() : undefined,
          media: cmsForm.mediaSrc.trim()
            ? [
                {
                  kind: cmsForm.mediaKind,
                  src: cmsForm.mediaSrc.trim(),
                  alt: cmsForm.mediaAlt.trim() || undefined
                }
              ]
            : undefined
        },
        cmsAdminToken.trim(),
        authUser.uid
      );

      setLetters((previous: Letter[]) => {
        const existingIndex = previous.findIndex((item) => item.id === savedLetter.id);
        if (existingIndex >= 0) {
          return previous.map((item, index) => (index === existingIndex ? savedLetter : item));
        }

        return [...previous, savedLetter];
      });

      setCmsForm(letterToForm(savedLetter));
      setCmsMessage("Letter saved.");
    } catch (error) {
      setCmsMessage(error instanceof Error ? error.message : "Failed to save letter.");
    } finally {
      setCmsBusy(false);
    }
  };

  const handleCmsLetterPick = (letterId: string) => {
    const letter = letters.find((item) => item.id === letterId);
    if (!letter) {
      return;
    }

    setCmsForm(letterToForm(letter));
    setCmsMessage(null);
  };

  const handleCmsNewDraft = () => {
    setCmsForm(createEmptyLetterForm());
    setCmsMessage("Creating new letter draft. Fill fields, then Save letter.");
  };

  const handleRefreshLetters = async () => {
    await loadLetters({ background: true });
  };

  const handleSyncOfflineQueue = async () => {
    await flushOfflineEventQueue();
    setPendingOfflineEvents(getOfflineQueueSize());
  };

  const handleClearOfflineQueue = () => {
    clearOfflineQueue();
    setPendingOfflineEvents(0);
  };

  return (
    <LazyMotion features={() => import("framer-motion").then((module) => module.domAnimation)} strict>
      <main className="app-shell">
        <DecorativeBackground />
        <section className="card">
        {!isOnline ? <p className="connectivity-banner">Offline mode: cached content may be limited.</p> : null}
        {isOnline && pendingOfflineEvents > 0 ? (
          <div className="connectivity-banner connectivity-banner--sync">
            <p>{pendingOfflineEvents} offline event(s) pending sync.</p>
            <button type="button" onClick={handleSyncOfflineQueue}>
              Sync now
            </button>
            <button type="button" onClick={handleClearOfflineQueue}>
              Clear queue
            </button>
          </div>
        ) : null}
        {swUpdateReady ? (
          <div className="connectivity-banner connectivity-banner--sync">
            <p>App update is available.</p>
            <button type="button" onClick={() => window.location.reload()}>
              Reload app
            </button>
          </div>
        ) : null}

        <AppHeader
          title="Open Me"
          subtitle={`Choose an envelope that matches the moment. Firebase: ${firebaseStatus}`}
        />
        <SiteNav />

        <div className="envelope-toolbar">
          <button type="button" onClick={handleRefreshLetters} disabled={lettersBusy || lettersRefreshing}>
            {lettersRefreshing ? "Refreshing..." : "Refresh letters"}
          </button>
          <p className="sync-status">
            {lettersLastSyncedAt
              ? `Last synced: ${new Date(lettersLastSyncedAt).toLocaleTimeString()}`
              : "Last synced: not yet"}
          </p>
        </div>

        <EntranceAnimator>
          <section className="auth-panel" aria-label="Authentication">
          {authUser ? (
            <div className="auth-row">
              <p className="status">Signed in: {authUser.email ?? "Unknown email"}</p>
              <button type="button" onClick={handleSignOut} disabled={authBusy}>
                Sign out
              </button>
            </div>
          ) : (
            <>
              <div className="auth-row">
                <button type="button" onClick={handleGoogleSignIn} disabled={authBusy}>
                  Continue with Google
                </button>
              </div>
              <div className="auth-row">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  placeholder="you@example.com"
                  aria-label="Email for sign-in link"
                />
                <button type="button" onClick={handleEmailLink} disabled={authBusy}>
                  Send email sign-in link
                </button>
              </div>
            </>
          )}
          {authMessage ? <p className="auth-message">{authMessage}</p> : null}
          </section>
        </EntranceAnimator>

        <EntranceAnimator delay={0.06}>
          <section className="envelope-grid" aria-label="Envelope dashboard">
          {lettersBusy ? <p className="status">Loading letters...</p> : null}
          {lettersMessage ? <p className="status">{lettersMessage}</p> : null}
          {!lettersBusy && letters.length === 0 ? (
            <div className="empty-state">
              <AnimatedIcon label="No letters" className="empty-illustration" />
              <p>No letters found yet. Sign in and use the CMS editor below to create your first one.</p>
            </div>
          ) : null}
          {letters.map((letter) => {
            const timeUnlocked = letter.lockType === "time" ? isUnlocked(letter, now) : true;
            const unlocked =
              letter.lockType === "honor"
                ? Boolean(confirmedHonorLocks[letter.id])
                : timeUnlocked;

            const statusNote =
              letter.lockType === "time" && !timeUnlocked
                ? lockCountdownLabel(letter, now)
                : letter.lockType === "honor" && !unlocked
                  ? "Confirm when you are ready."
                  : "";

            const actionDisabled = letter.lockType === "time" && !timeUnlocked;

            return (
              <EnvelopeCard
                key={letter.id}
                letter={letter}
                unlocked={unlocked}
                statusNote={statusNote}
                actionDisabled={actionDisabled}
                onOpen={() => openLetter(letter.id)}
              />
            );
          })}
          </section>
        </EntranceAnimator>

        <EntranceAnimator delay={0.1}>
          {authUser ? (
            <section className="cms-panel" aria-label="CMS editor">
            <h2>CMS editor</h2>
            <div className="auth-row">
              <input
                type="password"
                value={cmsAdminToken}
                onChange={(event) => setCmsAdminToken(event.target.value)}
                placeholder="CMS admin token"
                aria-label="CMS admin token"
              />
            </div>

            {cmsSelectedLetter?.updatedAt ? (
              <p className="cms-meta">
                Last updated {new Date(cmsSelectedLetter.updatedAt).toLocaleString()}
                {cmsSelectedLetter.updatedBy ? ` by ${cmsSelectedLetter.updatedBy}` : ""}
              </p>
            ) : null}

            <div className="auth-row">
              <select
                value={cmsForm.id}
                onChange={(event) => handleCmsLetterPick(event.target.value)}
                aria-label="Select letter"
              >
                <option value="">Select existing letter</option>
                {letters.map((letter) => (
                  <option key={letter.id} value={letter.id}>
                    {letter.title}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleCmsNewDraft} disabled={cmsBusy}>
                New letter
              </button>
            </div>

            <div className="cms-grid">
              <input
                type="text"
                value={cmsForm.id}
                onChange={(event) => setCmsForm((prev) => ({ ...prev, id: event.target.value }))}
                placeholder="id"
                aria-label="Letter ID"
              />
              <input
                type="text"
                value={cmsForm.title}
                onChange={(event) => setCmsForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="title"
                aria-label="Letter title"
              />
              <input
                type="text"
                value={cmsForm.preview}
                onChange={(event) => setCmsForm((prev) => ({ ...prev, preview: event.target.value }))}
                placeholder="preview"
                aria-label="Letter preview"
              />
              <textarea
                value={cmsForm.content}
                onChange={(event) => setCmsForm((prev) => ({ ...prev, content: event.target.value }))}
                placeholder="content"
                aria-label="Letter content"
              />
              <select
                value={cmsForm.lockType}
                onChange={(event) =>
                  setCmsForm((prev) => ({
                    ...prev,
                    lockType: event.target.value as "honor" | "time"
                  }))
                }
                aria-label="Lock type"
              >
                <option value="honor">honor</option>
                <option value="time">time</option>
              </select>
              <input
                type="text"
                value={cmsForm.unlockAt}
                onChange={(event) => setCmsForm((prev) => ({ ...prev, unlockAt: event.target.value }))}
                placeholder="unlockAt (ISO for time lock)"
                aria-label="Unlock at"
              />
              <select
                value={cmsForm.mediaKind}
                onChange={(event) =>
                  setCmsForm((prev) => ({
                    ...prev,
                    mediaKind: event.target.value as "image" | "audio" | "video"
                  }))
                }
                aria-label="Media kind"
              >
                <option value="image">image</option>
                <option value="audio">audio</option>
                <option value="video">video</option>
              </select>
              <input
                type="text"
                value={cmsForm.mediaSrc}
                onChange={(event) => setCmsForm((prev) => ({ ...prev, mediaSrc: event.target.value }))}
                placeholder="media src (optional)"
                aria-label="Media source"
              />
              <input
                type="text"
                value={cmsForm.mediaAlt}
                onChange={(event) => setCmsForm((prev) => ({ ...prev, mediaAlt: event.target.value }))}
                placeholder="media alt (optional)"
                aria-label="Media alt"
              />
            </div>

            <div className="auth-row">
              <button type="button" onClick={handleCmsSave} disabled={cmsBusy}>
                {cmsBusy ? "Saving..." : "Save letter"}
              </button>
              {cmsMessage ? <p className="auth-message">{cmsMessage}</p> : null}
            </div>
            </section>
          ) : (
            <section className="cms-panel" aria-label="CMS editor">
              <h2>CMS editor</h2>
              <p className="cms-lock-note">Sign in first to access the CMS editor.</p>
            </section>
          )}
        </EntranceAnimator>
        </section>

        <AnimatePresence>
          {activeLetter ? (
            <LetterViewer
              letter={activeLetter}
              onClose={() => setActiveLetterId(null)}
              onEmergencySupport={handleEmergencySupport}
              emergencyBusy={emergencyBusy}
              emergencyMessage={emergencyMessage}
            />
          ) : null}
        </AnimatePresence>
      </main>
    </LazyMotion>
  );
}

export default App;
