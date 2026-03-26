'use client';

import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Upload, X, FileIcon, ImageIcon, VideoIcon, CheckCircle2, AlertCircle, Loader2, Film } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

interface FileObject {
  id: string;
  url: string;
  name: string;
  type: string;
  progress: number;
  error?: string;
  isInitial?: boolean;
}

interface FileUploadProps {
  onUploadComplete: (urls: string[]) => void;
  initialUrls?: string[];
  maxFiles?: number;
  accept?: string; // e.g. "image/*,video/*"
  folder?: string;
  label?: string;
  maxSizeMB?: number;
}

const FileUpload = memo(({
  onUploadComplete,
  initialUrls = [],
  maxFiles = 5,
  accept = "image/*,video/*",
  folder = "uploads",
  label = "Upload Files",
  maxSizeMB = 10
}: FileUploadProps) => {
  const [files, setFiles] = useState<FileObject[]>(() => {
    if (initialUrls.length > 0) {
      return initialUrls.map((url, index) => ({ 
        id: `initial-${index}-${url.substring(url.length - 10)}`,
        url, 
        name: (url || '').split('/').pop()?.split('?')[0] || 'Existing File', 
        type: url.toLowerCase().includes('.mp4') || url.toLowerCase().includes('.mov') ? 'video/mp4' : 'image/jpeg', 
        progress: 100,
        isInitial: true
      }));
    }
    return [];
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // We don't need the initialization useEffect anymore if we initialize in useState

  const uploadFiles = useCallback(async (newFiles: File[]) => {
    const currentFilesCount = files.filter(f => !f.error).length;
    const remainingSlots = maxFiles - currentFilesCount;
    const filesToUpload = newFiles.slice(0, remainingSlots);

    if (filesToUpload.length === 0 && newFiles.length > 0) {
      alert(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    const newFileObjects = filesToUpload.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: '',
      name: file.name,
      type: file.type,
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFileObjects]);

    const uploadPromises = filesToUpload.map((file, index) => {
      const fileObj = newFileObjects[index];
      
      // Validation
      if (file.size > maxSizeMB * 1024 * 1024) {
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, error: `File too large (max ${maxSizeMB}MB)` } : f));
        return Promise.resolve(null);
      }

      const fileName = `${fileObj.id}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<FileObject | null>((resolve) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, progress } : f));
          }, 
          (error) => {
            console.error("Upload error:", error);
            setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, error: error.message } : f));
            resolve(null);
          }, 
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const completedFile = { ...fileObj, url: downloadURL, progress: 100 };
            setFiles(prev => prev.map(f => f.id === fileObj.id ? completedFile : f));
            resolve(completedFile);
          }
        );
      });
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulResults = results.filter((r): r is FileObject => r !== null);
      
      // We need to get the latest state to call onUploadComplete correctly
      setFiles(currentFiles => {
        const allUrls = currentFiles
          .filter(f => f.url && !f.error)
          .map(f => f.url);
        onUploadComplete(allUrls);
        return currentFiles;
      });
    } catch (error) {
      console.error("Error in batch upload:", error);
    }
  }, [files, maxFiles, maxSizeMB, folder, onUploadComplete]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(Array.from(e.target.files));
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = useCallback(async (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (!fileToRemove) return;

    if (fileToRemove.url && fileToRemove.url.startsWith('https://firebasestorage.googleapis.com')) {
      try {
        // Only delete from storage if it's not an initial file (optional policy)
        // Or if the user explicitly wants to delete from storage
        const fileRef = ref(storage, fileToRemove.url);
        await deleteObject(fileRef);
      } catch (error) {
        console.error("Error deleting file from storage:", error);
        // Even if storage delete fails, we remove from UI
      }
    }
    
    setFiles(prev => {
      const remaining = prev.filter(f => f.id !== id);
      onUploadComplete(remaining.filter(f => f.url && !f.error).map(f => f.url));
      return remaining;
    });
  }, [files, onUploadComplete]);

  return (
    <div className="space-y-4">
      {label && <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">{label}</label>}
      
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); uploadFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => files.filter(f => !f.error).length < maxFiles && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer group overflow-hidden ${
          isDragging 
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]' 
            : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50'
        } ${files.filter(f => !f.error).length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/30 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          multiple={maxFiles > 1}
          accept={accept}
          className="hidden"
        />
        
        <div className="relative z-10 flex flex-col items-center">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-all duration-500 ${
            isDragging ? 'bg-emerald-600 text-white rotate-12 scale-110 shadow-2xl shadow-emerald-200' : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 group-hover:rotate-3'
          }`}>
            <Upload className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            {isDragging ? 'Drop files here' : 'Upload Media'}
          </h3>
          <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto leading-relaxed">
            Drag and drop images or videos, or click to browse. Support for high-quality factory showcases.
          </p>
          <div className="mt-6 flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="px-3 py-1 bg-slate-100 rounded-full">Max {maxFiles} files</span>
            <span className="px-3 py-1 bg-slate-100 rounded-full">Images & Videos</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <AnimatePresence>
          {files.map((file) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="relative aspect-square rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group"
            >
              {file.url ? (
                file.type.startsWith('image/') ? (
                  <Image 
                    src={file.url} 
                    alt={file.name} 
                    fill 
                    unoptimized 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <Film className="w-8 h-8 text-white/50" />
                    <video src={file.url} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                  </div>
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-50">
                  {file.error ? (
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                      <p className="text-[10px] text-red-500 font-bold leading-tight px-2">{file.error}</p>
                    </div>
                  ) : (
                    <>
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300" 
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                  className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {file.url && !file.error && (
                <div className="absolute top-3 right-3">
                  <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});

FileUpload.displayName = 'FileUpload';
export default FileUpload;
