'use client';

import React, { useState, useRef, useEffect } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Upload, X, FileIcon, ImageIcon, VideoIcon, CheckCircle2, AlertCircle, Loader2, Film } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  onUploadComplete: (urls: string[]) => void;
  initialUrls?: string[];
  maxFiles?: number;
  accept?: string; // e.g. "image/*,video/*"
  folder?: string;
  label?: string;
  maxSizeMB?: number;
}

export default function FileUpload({
  onUploadComplete,
  initialUrls = [],
  maxFiles = 5,
  accept = "image/*,video/*",
  folder = "uploads",
  label = "Upload Files",
  maxSizeMB = 10
}: FileUploadProps) {
  const [files, setFiles] = useState<{ url: string; name: string; type: string; progress: number; error?: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialUrls.length > 0 && files.length === 0) {
      const initialFiles = initialUrls.map(url => ({ 
        url, 
        name: 'Existing File', 
        type: url.includes('.mp4') ? 'video/mp4' : 'image/jpeg', 
        progress: 100 
      }));
      setFiles(initialFiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUrls]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (newFiles: File[]) => {
    const remainingSlots = maxFiles - files.length;
    const filesToUpload = newFiles.slice(0, remainingSlots);

    if (filesToUpload.length === 0 && newFiles.length > 0) {
      alert(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    const uploadPromises = filesToUpload.map(async (file) => {
      // Validation
      if (file.size > maxSizeMB * 1024 * 1024) {
        return { name: file.name, error: `File too large (max ${maxSizeMB}MB)` };
      }

      const fileId = Math.random().toString(36).substring(7);
      const fileName = `${fileId}_${file.name}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise<{ url: string; name: string; type: string; progress: number }>((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setFiles(prev => prev.map(f => f.name === file.name ? { ...f, progress } : f));
          }, 
          (error) => {
            console.error("Upload error:", error);
            setFiles(prev => prev.map(f => f.name === file.name ? { ...f, error: error.message } : f));
            reject(error);
          }, 
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ url: downloadURL, name: file.name, type: file.type, progress: 100 });
          }
        );
      });
    });

    // Add placeholder files to state for progress tracking
    const placeholderFiles = filesToUpload.map(file => ({
      url: '',
      name: file.name,
      type: file.type,
      progress: 0
    }));
    setFiles(prev => [...prev, ...placeholderFiles]);

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(r => !('error' in r)) as { url: string; name: string; type: string; progress: number }[];
      
      setFiles(prev => {
        const existing = prev.filter(f => f.url !== '');
        const updated = [...existing, ...successfulUploads];
        onUploadComplete(updated.map(f => f.url));
        return updated;
      });
    } catch (error) {
      console.error("Error in batch upload:", error);
    }
  };

  const removeFile = async (index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove.url && fileToRemove.url.startsWith('https://firebasestorage.googleapis.com')) {
      try {
        const fileRef = ref(storage, fileToRemove.url);
        await deleteObject(fileRef);
      } catch (error) {
        console.error("Error deleting file from storage:", error);
      }
    }
    
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onUploadComplete(newFiles.map(f => f.url));
  };

  return (
    <div className="space-y-4">
      {label && <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-widest">{label}</label>}
      
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); uploadFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => files.length < maxFiles && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-[2.5rem] p-12 text-center transition-all cursor-pointer group overflow-hidden ${
          isDragging 
            ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]' 
            : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50'
        } ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          {files.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="relative aspect-square rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group"
            >
              {file.url ? (
                file.type.startsWith('image/') ? (
                  <Image 
                    src={file.url} 
                    alt="preview" 
                    fill 
                    unoptimized 
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
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
                    <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                  ) : (
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                  )}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300" 
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  className="p-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all transform hover:scale-110 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {file.url && (
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
}
