export type LockType = "honor" | "time";

export type MediaKind = "image" | "audio" | "video";

export type MediaBlock = {
  kind: MediaKind;
  src: string;
  alt?: string;
};

export type Letter = {
  id: string;
  title: string;
  preview: string;
  content: string;
  lockType: LockType;
  unlockAt?: string;
  media?: MediaBlock[];
  updatedAt?: string;
  updatedBy?: string;
};

const nowPlusHours = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

export const seedLetters: Letter[] = [
  {
    id: "sad-day",
    title: "Open when you feel sad",
    preview: "A reminder that you are deeply loved.",
    content:
      "Hey love, this feeling will pass. Drink some water, breathe, and remember how strong you are. I am always cheering for you.",
    lockType: "honor",
    media: [
      {
        kind: "image",
        src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1100&q=70",
        alt: "Warm memory"
      }
    ]
  },
  {
    id: "anniversary",
    title: "Open on our anniversary",
    preview: "A letter for our special day.",
    content:
      "Happy anniversary, my favorite person. Thank you for every laugh, every lesson, and every little moment.",
    lockType: "time",
    unlockAt: nowPlusHours(24),
    media: [
      {
        kind: "audio",
        src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      }
    ]
  },
  {
    id: "cant-sleep",
    title: "Open when you can't sleep",
    preview: "Slow down and breathe with me.",
    content:
      "Close your eyes. Inhale for four, hold for four, exhale for four. You are safe, and tomorrow can wait.",
    lockType: "honor",
    media: [
      {
        kind: "video",
        src: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
      }
    ]
  }
];

export function isUnlocked(letter: Letter, now = new Date()) {
  if (letter.lockType === "honor") {
    return true;
  }

  if (!letter.unlockAt) {
    return false;
  }

  return now >= new Date(letter.unlockAt);
}

export function lockLabel(letter: Letter, now = new Date()) {
  if (letter.lockType === "honor") {
    return "Honor lock";
  }

  if (!letter.unlockAt) {
    return "Time lock";
  }

  const unlockAt = new Date(letter.unlockAt);
  if (now >= unlockAt) {
    return "Unlocked";
  }

  return `Unlocks ${unlockAt.toLocaleString()}`;
}

export function lockCountdownLabel(letter: Letter, now = new Date()) {
  if (letter.lockType !== "time" || !letter.unlockAt) {
    return "";
  }

  const unlockAt = new Date(letter.unlockAt).getTime();
  const differenceMs = unlockAt - now.getTime();

  if (differenceMs <= 0) {
    return "Ready to open";
  }

  const totalMinutes = Math.ceil(differenceMs / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `Opens in ${hours}h ${minutes}m`;
  }

  return `Opens in ${minutes}m`;
}
