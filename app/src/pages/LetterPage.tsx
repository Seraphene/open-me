import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import DecorativeBackground from "../components/layout/DecorativeBackground";
import EntranceAnimator from "../components/primitives/EntranceAnimator";
import SiteNav from "../components/layout/SiteNav";
import { isUnlocked, lockCountdownLabel, seedLetters, type Letter } from "../features/envelopes";

const honorLockStorageKey = "openme.honorLockConfirmations";
const lettersCacheStorageKey = "openme.cachedLetters";

type LetterListResponse = {
  letters?: Letter[];
};

type EmergencySupportPayload = {
  message: string;
  context?: string;
};

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

function LetterPage() {
  const { letterId } = useParams();
  const [letters, setLetters] = useState<Letter[]>(seedLetters);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmedHonorLocks, setConfirmedHonorLocks] = useState<Record<string, boolean>>({});
  const [emergencyBusy, setEmergencyBusy] = useState(false);
  const [emergencyMessage, setEmergencyMessage] = useState<string | null>(null);

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
    const load = async () => {
      setBusy(true);
      setMessage(null);

      try {
        const loadedLetters = await fetchLetters();
        setLetters(loadedLetters);
      } catch {
        const cachedLettersRaw = window.localStorage.getItem(lettersCacheStorageKey);
        if (cachedLettersRaw) {
          try {
            const parsed = JSON.parse(cachedLettersRaw) as Letter[];
            if (Array.isArray(parsed) && parsed.length) {
              setLetters(parsed);
              setMessage("Offline mode: showing cached letter content.");
              return;
            }
          } catch {
            setMessage("Could not parse cached letters. Falling back to defaults.");
          }
        }

        setLetters(seedLetters);
        setMessage("Could not sync latest letters. Showing local default letters.");
      } finally {
        setBusy(false);
      }
    };

    void load();
  }, []);

  const letter = useMemo(() => letters.find((item) => item.id === letterId) ?? null, [letterId, letters]);

  const unlocked = useMemo(() => {
    if (!letter) {
      return false;
    }

    if (letter.lockType === "honor") {
      return Boolean(confirmedHonorLocks[letter.id]);
    }

    return isUnlocked(letter);
  }, [confirmedHonorLocks, letter]);

  const handleHonorUnlock = () => {
    if (!letter || letter.lockType !== "honor") {
      return;
    }

    const accepted = window.confirm("Are you sure you're ready to open this letter?");
    if (!accepted) {
      return;
    }

    setConfirmedHonorLocks((previous) => ({
      ...previous,
      [letter.id]: true
    }));
  };

  const handleEmergencySupport = async () => {
    if (!letter) {
      return;
    }

    setEmergencyBusy(true);
    setEmergencyMessage(null);
    try {
      await postEmergencySupport({
        message: `Emergency support requested while reading letter: ${letter.title}`,
        context: `letterId=${letter.id}; lockType=${letter.lockType}`
      });
      setEmergencyMessage("Emergency support request sent.");
    } catch (error) {
      setEmergencyMessage(error instanceof Error ? error.message : "Emergency support request failed.");
    } finally {
      setEmergencyBusy(false);
    }
  };

  return (
    <main className="app-shell">
      <DecorativeBackground />
      <section className="card letter-page-card">
        <AppHeader title="Letter" subtitle="Full-page reading mode with route-based navigation." />
        <SiteNav />

        <section className="letter-page-back">
          <Link className="hero-button hero-button--ghost" to="/open">
            Back to experience
          </Link>
        </section>

        {busy ? <p className="status">Loading letter...</p> : null}
        {message ? <p className="status">{message}</p> : null}

        {!busy && !letter ? <p className="status">Letter not found.</p> : null}

        {letter ? (
          <EntranceAnimator>
            <article className="letter-page-content" aria-label={`Letter ${letter.title}`}>
              <header className="letter-page-header">
                <h2>{letter.title}</h2>
                <p className="badge">
                  {letter.lockType === "time" && !unlocked
                    ? lockCountdownLabel(letter)
                    : letter.lockType === "honor" && !unlocked
                      ? "Confirm when you are ready."
                      : "Unlocked"}
                </p>
              </header>

              {!unlocked ? (
                <section className="letter-page-locked">
                  <p>This letter is still locked.</p>
                  {letter.lockType === "honor" ? (
                    <button type="button" onClick={handleHonorUnlock}>
                      Confirm and unlock
                    </button>
                  ) : null}
                </section>
              ) : (
                <>
                  <p className="letter-page-message">{letter.content}</p>
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

                  <div className="letter-page-actions">
                    <button
                      type="button"
                      className="emergency-button"
                      onClick={handleEmergencySupport}
                      disabled={emergencyBusy}
                    >
                      {emergencyBusy ? "Sending..." : "Emergency support"}
                    </button>
                    {emergencyMessage ? <p className="viewer-message">{emergencyMessage}</p> : null}
                  </div>
                </>
              )}
            </article>
          </EntranceAnimator>
        ) : null}
      </section>
    </main>
  );
}

export default LetterPage;
