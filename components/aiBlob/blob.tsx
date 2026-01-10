"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { FaPlus, FaCamera, FaImages } from "react-icons/fa";
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

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  /* =========================
     AUTH
     ========================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  /* =========================
     FILE PROCESSOR (shared)
     ========================= */
  const processFile = async (file: File) => {
    if (!userId) {
      toast.error("Sign in first");
      return;
    }

    try {
      setLoading(true);
      setShowPicker(false);

      let finalPlantId: string;

      if (plantId) {
        await addAnalysisToExistingPlant(userId, plantId, file);
        finalPlantId = plantId;
      } else {
        const result = await addNewPlantWithAnalysis(userId, file);
        finalPlantId = result.plant.id;
      }

      toast.success("Analysis completed");
      router.replace(`/plant/${finalPlantId}`);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Analysis failed");
    } finally {
      setLoading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  /* =========================
     INPUT HANDLERS
     ========================= */
  const onCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const onGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  /* =========================
     UI HANDLERS
     ========================= */
  const handleMainClick = () => {
    if (!userId) {
      toast.error("Sign in first");
      return;
    }
    if (!loading) setShowPicker(true);
  };

  return (
    <>
      {/* Camera input */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={onCameraChange}
        hidden
      />

      {/* Gallery input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={onGalleryChange}
        hidden
      />

      {/* Floating Blob */}
      <div
        className={`${styles.blobWrapper} ${loading ? styles.disabled : ""}`}
        onClick={handleMainClick}
      >
        <div className={styles.blob}>
          <FaPlus className={styles.plusIcon} />
        </div>
      </div>

      {/* Picker Overlay */}
      {showPicker && !loading && (
        <div className={styles.pickerOverlay} onClick={() => setShowPicker(false)}>
          <div
            className={styles.picker}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => cameraInputRef.current?.click()}>
              <FaCamera />
              <span>Take Photo</span>
            </button>

            <button onClick={() => galleryInputRef.current?.click()}>
              <FaImages />
              <span>Choose from Gallery</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={styles.spinnerWrapper}>
          <Spinner />
        </div>
      )}
    </>
  );
};

export default Blob;
