'use client';

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const useStorage = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, path: string, purpose: string) => {
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setProgress(p);
          },
          (err) => {
            setError(err.message);
            setUploading(false);
            reject(err);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // Record upload in Firestore
            await addDoc(collection(db, 'uploads'), {
              userId: auth.currentUser?.uid,
              url: downloadURL,
              fileName: file.name,
              mimeType: file.type,
              size: file.size,
              purpose,
              createdAt: serverTimestamp(),
            });

            setUploading(false);
            resolve(downloadURL);
          }
        );
      });
    } catch (err: any) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  }, []);

  const deleteFile = useCallback(async (url: string) => {
    setError(null);
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  return { uploadFile, deleteFile, uploading, progress, error };
};
