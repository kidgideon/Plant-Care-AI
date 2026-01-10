"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { FaPlus } from "react-icons/fa";
import { toast } from "sonner";

import styles from "./blob.module.css";
import Spinner from "../spinner/spinner";
import { auth } from "../../firebase/client";
import {
  addNewPlantWithAnalysis,
  addAnalysisToExistingPlant,
} from "../../hooks/plant";

interface BlobProps {
  plantId?: string; // present → add analysis, absent → create plant
}

const Blob = ({ plantId }: BlobProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     AUTH LISTENER
     ========================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  /* =========================
     FILE HANDLER
     ========================= */
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userId) {
      toast.error("Sign in first");
      return;
    }

    try {
      setLoading(true);

      let finalPlantId: string;

      if (plantId) {
        await addAnalysisToExistingPlant(userId, plantId, file);
        finalPlantId = plantId;
      } else {
        const result = await addNewPlantWithAnalysis(userId, file);
        finalPlantId = result.plant.id;
      }

      toast.success("Analysis completed");

      // Force page data refresh even on same route
      router.replace(`/plant/${finalPlantId}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Analysis failed");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* =========================
     CLICK HANDLER
     ========================= */
  const handleClick = () => {
    if (!userId) {
      toast.error("Sign in first");
      return;
    }
    if (!loading) fileInputRef.current?.click();
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      {/* Floating Blob Button */}
      <div
        className={`${styles.blobWrapper} ${loading ? styles.disabled : ""}`}
        onClick={handleClick}
      >
        <div className={styles.blob}>
          <FaPlus className={styles.plusIcon} />
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className={styles.spinnerWrapper}>
          <Spinner />
        </div>
      )}
    </>
  );
};

export default Blob;
