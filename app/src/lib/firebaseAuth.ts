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
import { getFirebaseApp } from "./firebase";

const emailStorageKey = "openme.emailForSignIn";

function requireAuth() {
  const app = getFirebaseApp();
  if (!app) {
    throw new Error("Firebase is not configured.");
  }

  return getAuth(app);
}

export type AuthUser = Pick<User, "uid" | "email" | "displayName">;

export function onAuthUserChanged(callback: (user: AuthUser | null) => void) {
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

export async function signInWithGoogle() {
  const auth = requireAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account"
  });

  await signInWithPopup(auth, provider);
}

export async function sendEmailSignInLink(email: string) {
  const auth = requireAuth();

  await sendSignInLinkToEmail(auth, email, {
    url: window.location.origin,
    handleCodeInApp: true
  });

  window.localStorage.setItem(emailStorageKey, email);
}

export async function completeEmailLinkSignIn() {
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

export async function signOutCurrentUser() {
  const auth = requireAuth();
  await signOut(auth);
}
