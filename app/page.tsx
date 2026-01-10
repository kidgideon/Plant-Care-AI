"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/client";
import Image from "next/image";
import logo from "../images/logo.png";
import styles from "./page.module.css";

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait a minimum time for splash animation
    const timer = setTimeout(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) router.replace("/dashboard"); // go to dashboard if logged in
        else router.replace("/auth/login");    // else go to login
      });
    }, 1500); // 1.5s splash animation

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={styles.splashContainer}>
      <div className={styles.logoWrapper}>
        <Image src={logo} alt="AgroApp Logo" className={styles.logo} />
      </div>
      <div className={styles.textWrapper}>
        <h1 className={styles.brandText}>AgroApp</h1>
        <p className={styles.tagline}>An Intelligent System for Crop Health Monitoring and Disease Detection</p>
      </div>
      <div className={styles.loadingDots}>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default Page;
