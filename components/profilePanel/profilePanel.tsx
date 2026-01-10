"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FaUser,
  FaEnvelope,
  FaCamera,
  FaKey,
  FaSignOutAlt,
  FaTimes,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
import Image from "next/image";
import { auth, db, storage } from "../../firebase/client";
import type { User } from "../../models/structure";
import styles from "./profilePanel.module.css";
import { toast } from "sonner";

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfilePanel = ({ isOpen, onClose }: ProfilePanelProps) => {
  const router = useRouter();

  const [user, setUser] = useState<(User & { uid: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({ fullName: "" });

  /* Fetch user */
  useEffect(() => {
    return onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", authUser.uid));
      if (snap.exists()) {
        const data = snap.data() as User;
        setUser({ ...data, uid: authUser.uid });
        setFormData({ fullName: data.fullName });
        setPreviewUrl(data.dp ?? null);
      }
      setLoading(false);
    });
  }, []);

  /* Save */
  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      let dp = user.dp;

      if (selectedFile) {
        const storageRef = ref(
          storage,
          `users/${user.uid}/dp/${Date.now()}-${selectedFile.name}`
        );
        await uploadBytes(storageRef, selectedFile);
        dp = await getDownloadURL(storageRef);
      }

      await updateDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        dp,
      });

      setUser({ ...user, fullName: formData.fullName, dp });
      setEditing(false);
      toast.success("Profile updated");
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 className={styles.headerTitle}>Profile</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FaTimes />
          </button>
        </header>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <FaSpinner className={styles.spinner} />
            </div>
          ) : (
            <>
              {/* Profile Image */}
              <div className={styles.profilePictureSection}>
                <div className={styles.dpWrapper}>
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Profile"
                      width={120}
                      height={120}
                      className={styles.dp}
                    />
                  ) : (
                    <div className={styles.dpPlaceholder}>
                      <FaUser />
                    </div>
                  )}
                </div>

                {editing && (
                  <label className={styles.uploadBtn}>
                    <FaCamera /> Change Photo
                    <input
                      type="file"
                      hidden
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                )}
              </div>

              {/* Form */}
              <div className={styles.formSection}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    <FaUser /> Full Name
                  </label>
                  {editing ? (
                    <input
                      className={styles.fieldInput}
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ fullName: e.target.value })
                      }
                    />
                  ) : (
                    <div className={styles.fieldValue}>{user?.fullName}</div>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    <FaEnvelope /> Email
                  </label>
                  <div className={`${styles.fieldValue} ${styles.readOnly}`}>
                    {user?.email}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    <FaUser /> Role
                  </label>
                  <div className={`${styles.fieldValue} ${styles.readOnly}`}>
                    {user?.role}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actionsSection}>
                {editing ? (
                  <>
                    <button
                      className={`${styles.actionBtn} ${styles.btnSave}`}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? <FaSpinner /> : <FaCheck />} Save Changes
                    </button>

                    <button
                      className={`${styles.actionBtn} ${styles.btnCancel}`}
                      onClick={() => setEditing(false)}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className={`${styles.actionBtn} ${styles.btnEdit}`}
                    onClick={() => setEditing(true)}
                  >
                    <FaUser /> Edit Profile
                  </button>
                )}

                <button
                  className={`${styles.actionBtn} ${styles.btnReset}`}
                  onClick={() =>
                    user && sendPasswordResetEmail(auth, user.email)
                  }
                >
                  <FaKey /> Reset Password
                </button>

                <button
                  className={`${styles.actionBtn} ${styles.btnLogout}`}
                  onClick={async () => {
                    await signOut(auth);
                    router.push("/auth/login");
                  }}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePanel;
