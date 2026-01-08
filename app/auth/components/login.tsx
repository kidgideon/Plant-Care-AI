"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // import router
import styles from "./login.module.css"; // separate CSS for login form
import { login } from "../../../hooks/auth";
import logo from "../../../images/logo.png";
import { toast } from "sonner";

const LoginForm = () => {
  const router = useRouter(); // initialize router
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    await login(email, password);
    toast.success("Login successful!");

    // Clear inputs
    setEmail("");
    setPassword("");

    // Delay navigation by 2 seconds
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  } catch (err: any) {
    toast.error(err.message || "Something went wrong!");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className={styles.loginInterface}>
      <div className={styles.formContainer}>
        <Image src={logo} alt="PlantSight Logo" className={styles.logo} width={100} height={100} />

        <h1 className={styles.title}>Welcome Back</h1>
        <h1 className={styles.descText}>Log in to your account</h1>

        <form className={styles.loginForm} onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className={styles.forgotContainer}>
            <Link href="/auth/forgot-password" className={styles.forgotLink}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className={styles.questionDiv}>
          Don’t have an account?{" "}
          <Link href="/auth/signup">
            <span className={styles.loginLink}>Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
