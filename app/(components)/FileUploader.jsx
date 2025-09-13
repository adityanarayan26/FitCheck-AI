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
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-300
      ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <UploadCloud className="w-12 h-12 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        <p className="text-sm">{description}</p>
        <p className="text-xs mt-2">PNG, JPG, WEBP</p>
        {isDragActive ?
          <p className="mt-2 text-blue-500 font-semibold">Drop the file here...</p> :
          <p className="mt-2">or drag and drop an image</p>
        }
      </div>
    </div>
  );
};

export default FileUploader;