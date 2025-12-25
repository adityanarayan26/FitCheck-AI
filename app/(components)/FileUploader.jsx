"use client";
import { UploadCloud } from 'lucide-react';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUploader = ({ onFileChange, title, description }) => {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`relative overflow-hidden border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
      ${isDragActive
          ? 'border-purple-500 bg-purple-50/50'
          : 'border-slate-200 hover:border-purple-400 hover:bg-slate-50'}`}
    >
      <input {...getInputProps()} />

      <div className="relative flex flex-col items-center justify-center text-slate-500">
        <div className={`p-4 rounded-full mb-4 transition-all duration-200 ${isDragActive ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-400'}`}>
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
        <p className="text-sm text-slate-400 mb-0">{description}</p>
      </div>
    </div>
  );
};

export default FileUploader;