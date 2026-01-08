import { auth, db } from "../firebase/client";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import type { User } from "../models/structure";

// Utility: Generate DP URL from first letter of name
const generateDpUrl = (fullName: string) => {
  const firstLetter = fullName.trim()[0].toUpperCase();
  return `https://ui-avatars.com/api/?name=${firstLetter}&background=random&size=128`;
};

// SIGNUP
export const signup = async (fullName: string, email: string, password: string): Promise<FirebaseUser> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser: FirebaseUser = credential.user;

  const userData: User = {
    id: firebaseUser.uid,
    fullName,
    email: firebaseUser.email || email,
    role: "farmer",
    dp: generateDpUrl(fullName), // ✅ auto-generated DP
    createdAt: Timestamp.now(),
  };

  await setDoc(doc(db, "users", firebaseUser.uid), userData);

  return firebaseUser;
};

// LOGIN
export const login = async (email: string, password: string): Promise<FirebaseUser> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

// LOGOUT
export const logout = async () => {
  await auth.signOut();
};

