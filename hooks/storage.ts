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
  try {
    console.log("=== IMAGE UPLOAD STARTED ===");
    console.log("userId:", userId);
    console.log("plantId:", plantId);
    console.log("file:", { name: file.name, size: file.size, type: file.type });

    const storagePath = `users/${userId}/plants/${plantId}/${Date.now()}-${file.name}`;
    console.log("Storage path:", storagePath);

    const storageRef = ref(storage, storagePath);
    console.log("Storage ref created");

    const uploadTask = uploadBytesResumable(storageRef, file);
    console.log("Upload task created");

    return new Promise((resolve, reject) => {
      let completionHandled = false;
      
      // Timeout after 60 seconds
      const timeoutId = setTimeout(() => {
        if (!completionHandled) {
          console.error("=== UPLOAD TIMEOUT ===");
          console.error("Upload did not complete after 60 seconds");
          reject(new Error("Upload timeout - check Firebase Storage permissions and security rules"));
        }
      }, 60000);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress}% (${snapshot.bytesTransferred}/${snapshot.totalBytes} bytes)`);
          console.log("Upload state:", snapshot.state);
        },
        (error) => {
          completionHandled = true;
          clearTimeout(timeoutId);
          console.error("=== UPLOAD ERROR ===");
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          console.error("Full error:", error);
          reject(error);
        },
        async () => {
          completionHandled = true;
          clearTimeout(timeoutId);
          try {
            console.log("=== UPLOAD COMPLETED ===");
            console.log("Getting download URL...");
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Download URL obtained:", downloadURL);
            resolve(downloadURL);
          } catch (err: any) {
            console.error("=== ERROR GETTING DOWNLOAD URL ===");
            console.error("Error:", err);
            reject(err);
          }
        }
      );
    });
  } catch (err: any) {
    console.error("=== UPLOAD FUNCTION ERROR ===");
    console.error("Error:", err);
    throw err;
  }
};
