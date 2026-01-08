"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import Spinner from "../../../components/spinner/spinner";
import { login } from "../../../hooks/auth";
import logo from "../../../images/logo.png";

const Page = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      await login(email, password);
      // Redirect after successful login
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const goToForgotPassword = () => {
    router.push("/auth/forgot-password");
  };

  
  const goToSignup = () => {
    router.push("/auth/signup");
  };


  return (
    <div className={styles.loginInterface}>
      {loading && <Spinner />}

      <form className={styles.form} onSubmit={handleSubmit}>
        <Image src={logo} alt="CropCareAI" className={styles.logo} />

        <h1 className={styles.title}> Welcome Back</h1>

        {error && <p className={styles.error}>{error}</p>}

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
  <p className={styles.forgotPassword}>
          <span className={styles.forgotLink} onClick={goToForgotPassword}>
            Forgot password?
          </span>
        </p>

        <button type="submit" className={styles.button}>
          Login
        </button>

          <p className={styles.authSwitch}>
          Don't have an account?
          <span className={styles.authLink} onClick={goToSignup}>
            Signup
          </span>
        </p>
      </form>
    </div>
  );
};

export default Page;
