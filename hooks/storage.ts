import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/client";

/**
 * Uploads a File object to Firebase Storage and returns its public URL
 */
export const uploadPlantImage = async (
  userId: string,
  plantId: string,
  file: File
): Promise<string> => {
  const storageRef = ref(storage, `users/${userId}/plants/${plantId}/${Date.now()}-${file.name}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Optional: track progress
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};
