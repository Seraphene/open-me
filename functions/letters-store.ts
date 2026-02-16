type LockType = "honor" | "time";
type MediaKind = "image" | "audio" | "video";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";

export type MediaBlock = {
  kind: MediaKind;
  src: string;
  alt?: string;
};

export type LetterRecord = {
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

const defaultLetters: LetterRecord[] = [
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

let letterStore: LetterRecord[] = defaultLetters.map((letter) => ({
  ...letter,
  media: letter.media ? letter.media.map((item) => ({ ...item })) : undefined
}));

let firestoreDb: Firestore | null = null;

function normalizePrivateKey(rawKey: string) {
  return rawKey.replace(/\\n/g, "\n");
}

function getFirestoreCollectionName() {
  return process.env.OPEN_ME_FIRESTORE_LETTERS_COLLECTION ?? "open_me_letters";
}

function isFirestoreConfigured() {
  return Boolean(
    process.env.OPEN_ME_FIREBASE_PROJECT_ID &&
    process.env.OPEN_ME_FIREBASE_CLIENT_EMAIL &&
    process.env.OPEN_ME_FIREBASE_PRIVATE_KEY
  );
}

function getFirestoreDb() {
  if (!isFirestoreConfigured()) {
    return null;
  }

  if (firestoreDb) {
    return firestoreDb;
  }

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.OPEN_ME_FIREBASE_PROJECT_ID,
        clientEmail: process.env.OPEN_ME_FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.OPEN_ME_FIREBASE_PRIVATE_KEY ?? "")
      })
    });
  }

  firestoreDb = getFirestore();
  return firestoreDb;
}

function cloneLetter(letter: LetterRecord): LetterRecord {
  return {
    ...letter,
    media: letter.media ? letter.media.map((item) => ({ ...item })) : undefined
  };
}

function fromUnknownLetter(value: unknown): LetterRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<LetterRecord>;
  if (
    !candidate.id ||
    !candidate.title ||
    !candidate.preview ||
    !candidate.content ||
    (candidate.lockType !== "honor" && candidate.lockType !== "time")
  ) {
    return null;
  }

  return {
    id: candidate.id,
    title: candidate.title,
    preview: candidate.preview,
    content: candidate.content,
    lockType: candidate.lockType,
    unlockAt: candidate.unlockAt,
    media: candidate.media,
    updatedAt: candidate.updatedAt,
    updatedBy: candidate.updatedBy
  };
}

export async function listLetters() {
  const db = getFirestoreDb();
  if (!db) {
    return letterStore.map((letter) => cloneLetter(letter));
  }

  const collectionName = getFirestoreCollectionName();
  const snapshot = await db.collection(collectionName).get();

  if (snapshot.empty) {
    const writeBatch = db.batch();
    for (const letter of defaultLetters) {
      const documentRef = db.collection(collectionName).doc(letter.id);
      writeBatch.set(documentRef, cloneLetter(letter));
    }

    await writeBatch.commit();
    return defaultLetters.map((letter) => cloneLetter(letter));
  }

  return snapshot.docs
    .map((doc) => fromUnknownLetter(doc.data()))
    .filter((item): item is LetterRecord => Boolean(item))
    .sort((left, right) => left.id.localeCompare(right.id));
}

export async function upsertLetter(letter: LetterRecord, metadata?: { updatedBy?: string }) {
  const existingIndex = letterStore.findIndex((item) => item.id === letter.id);
  const existing = existingIndex >= 0 ? letterStore[existingIndex] : undefined;
  const normalized = cloneLetter({
    ...letter,
    updatedAt: new Date().toISOString(),
    updatedBy: metadata?.updatedBy ?? existing?.updatedBy
  });

  const db = getFirestoreDb();
  if (!db) {
    if (existingIndex >= 0) {
      letterStore[existingIndex] = normalized;
      return cloneLetter(normalized);
    }

    letterStore = [...letterStore, normalized];
    return cloneLetter(normalized);
  }

  await db.collection(getFirestoreCollectionName()).doc(normalized.id).set(normalized);

  if (existingIndex >= 0) {
    letterStore[existingIndex] = normalized;
  } else {
    letterStore = [...letterStore, normalized];
  }

  return cloneLetter(normalized);
}

export function __resetLetterStore() {
  letterStore = defaultLetters.map((letter) => cloneLetter(letter));
}
