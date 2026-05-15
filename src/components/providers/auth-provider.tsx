"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore, UserProfile } from "@/store/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading, initGuest } = useAuthStore();

  useEffect(() => {
    // Initialize guest state immediately (works without auth)
    initGuest();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const ref = doc(db, "users", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName ?? "Anonymous",
              email: user.email ?? "",
              photoURL: user.photoURL ?? "",
              elo: 1000,
              wins: 0,
              losses: 0,
              isPro: false,
              selectedCoach: "arman",
              selectedSkin: "classic",
              city: "Almaty",
              gamesPlayed: 0,
              aiReviewsToday: 0,
            };
            await setDoc(ref, { ...newProfile, createdAt: serverTimestamp() });
            setProfile(newProfile);
          }
        } catch (e) {
          console.error("Profile fetch failed:", e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setProfile, setLoading, initGuest]);

  return <>{children}</>;
}
