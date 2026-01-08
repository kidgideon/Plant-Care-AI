"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Next.js router
import styles from "./page.module.css";
import Spinner from "../../../components/spinner/spinner";
import { signup } from "../../../hooks/auth";
import logo from "../../../images/logo.png";

const Page = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await signup(fullName, email, password);
      // Redirect to dashboard or login after signup
      router.push("/dashboard"); 
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/auth/login");
  };

  return (
    <div className={styles.signupInterface}>
      {loading && <Spinner />}

      <form className={styles.form} onSubmit={handleSubmit}>
        <Image src={logo} alt="CropCareAI" className={styles.logo} />

        <h1 className={styles.title}>Create Account</h1>

        {error && <p className={styles.error}>{error}</p>}

        <label className={styles.label}>
          Full Name
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>

        <label className={styles.label}>
          Email Address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className={styles.label}>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        <button type="submit" className={styles.button}>
          Sign Up
        </button>

        {/* Router-based login link */}
        <p className={styles.authSwitch}>
          Already have an account?
          <span className={styles.authLink} onClick={goToLogin}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Page;
