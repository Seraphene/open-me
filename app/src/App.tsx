import { useEffect, useMemo, useState } from "react";
import EnvelopeCard from "./components/EnvelopeCard";
import LetterViewer from "./components/LetterViewer";
import { isUnlocked, seedLetters } from "./features/envelopes";
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

const emailStorageKey = "openme.emailForSignIn";

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

async function postLetterOpenEvent(payload: LetterOpenEventPayload) {
  await fetch("/api/letter-open", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

async function postReadReceipt(payload: ReadReceiptPayload) {
  await fetch("/api/read-receipt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
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
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [confirmedHonorLocks, setConfirmedHonorLocks] = useState<Record<string, boolean>>({});
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [emergencyBusy, setEmergencyBusy] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const firebaseStatus = getFirebaseInitStatus();

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

  const activeLetter = useMemo(
    () => seedLetters.find((letter) => letter.id === activeLetterId) ?? null,
    [activeLetterId]
  );

  const openLetter = (letterId: string) => {
    const letter = seedLetters.find((item) => item.id === letterId);
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

  return (
    <main className="app-shell">
      <section className="card">
        {!isOnline ? <p className="connectivity-banner">Offline mode: cached content may be limited.</p> : null}

        <header className="topbar">
          <h1>Open Me</h1>
          <p className="status">Firebase: {firebaseStatus}</p>
        </header>

        <p className="subtitle">Choose an envelope that matches the moment.</p>

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

        <section className="envelope-grid" aria-label="Envelope dashboard">
          {seedLetters.map((letter) => {
            const unlocked =
              letter.lockType === "honor"
                ? Boolean(confirmedHonorLocks[letter.id])
                : isUnlocked(letter);

            return (
              <EnvelopeCard
                key={letter.id}
                letter={letter}
                unlocked={unlocked}
                onOpen={() => openLetter(letter.id)}
              />
            );
          })}
        </section>
      </section>

      {activeLetter ? (
        <LetterViewer
          letter={activeLetter}
          onClose={() => setActiveLetterId(null)}
          onEmergencySupport={handleEmergencySupport}
          emergencyBusy={emergencyBusy}
          emergencyMessage={emergencyMessage}
        />
      ) : null}
    </main>
  );
}

export default App;
