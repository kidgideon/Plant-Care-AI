import { auth, db } from "../firebase/client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  deleteUser,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import type { User } from "../models/structure";
import { toast } from "sonner";

/**
 * Utility: Generate display picture URL safely
 */
const generateDpUrl = (fullName: string) => {
  const letter = fullName?.trim()?.charAt(0)?.toUpperCase() || "U";
  return `https://ui-avatars.com/api/?name=${letter}&background=random&size=128`;
};

/**
 * SIGNUP
 * Returns FirebaseUser on success, null on failure
 */
export const signup = async (
  fullName: string,
  email: string,
  password: string
): Promise<FirebaseUser | null> => {
  if (!fullName.trim()) {
    toast.error("Full name is required");
    return null;
  }

  let firebaseUser: FirebaseUser;

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    firebaseUser = credential.user;
  } catch (err: any) {
    toast.error(err.message || "Signup failed");
    return null;
  }

  try {
    const userData: User = {
      fullName: fullName.trim(),
      email: firebaseUser.email || email,
      role: "farmer",
      dp: generateDpUrl(fullName),
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, "users", firebaseUser.uid), userData);

    toast.success("Account created successfully!");
    return firebaseUser;
  } catch (err: any) {
    // Roll back auth user if Firestore write fails
    await deleteUser(firebaseUser).catch(() => null);
    toast.error("Account creation failed. Please try again.");
    return null;
  }
};

/**
 * LOGIN
 * Returns FirebaseUser on success, null on failure
 */
export const login = async (
  email: string,
  password: string
): Promise<FirebaseUser | null> => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    toast.success("Logged in successfully!");
    return credential.user;
  } catch (err: any) {
    toast.error(err.message || "Login failed");
    return null;
  }
};

/**
 * LOGOUT
 */
export const logout = async () => {
  try {
    await auth.signOut();
    toast.success("Logged out successfully!");
  } catch (err: any) {
    toast.error(err.message || "Logout failed");
  }
};
