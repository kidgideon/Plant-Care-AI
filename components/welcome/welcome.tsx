"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/client";
import styles from "./welcome.module.css";

const WelcomeTag = () => {
  const [fullname, setFullname] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateString, setDateString] = useState("");

  // Get today's date formatted like "January 9 Thursday 2026"
  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    setDateString(today.toLocaleDateString("en-US", options));
  }, []);

  // Listen to auth state and fetch user's fullname
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFullname("Guest");
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setFullname(data.fullName || "User");
        } else {
          setFullname("User");
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setFullname("User");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.welcomedate}>
      {/* Welcome message */}
      <p className={styles.welcomeTag}>
        {loading ? <span className={styles.skeletonText}></span> : `Hello, ${fullname}`}
      </p>

      {/* Date */}
      <p className={styles.dateTag}>
        {loading ? <span className={styles.skeletonText}></span> : dateString}
      </p>
    </div>
  );
};

export default WelcomeTag;
