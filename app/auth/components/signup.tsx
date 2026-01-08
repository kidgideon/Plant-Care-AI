"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"; // import router
import styles from "./signup.module.css";
import { signup } from "../../../hooks/auth";
import logo from "../../../images/logo.png";
import { toast } from "sonner";

const SignupForm = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(fullName, email, password);
      toast.success("Signup successful!");

      // Clear inputs
      setFullName("");
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
    <div className={styles.signupInterface}>
      <div className={styles.formContainer}>
        <Image src={logo} alt="PlantSight Logo" className={styles.logo} width={100} height={100} />

        <h1 className={styles.title}>Welcome</h1>
        <h1 className={styles.descText}>Create An Account</h1>

        <form className={styles.signupForm} onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
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
          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className={styles.questionDiv}>
          Already have an account?{" "}
          <Link href="/auth/login">
            <span className={styles.loginLink}>Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
