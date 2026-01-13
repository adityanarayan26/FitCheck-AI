"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { User, Shirt, Wand2, Sparkles, Download, Clock, Save, Check, Upload } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { saveImage } from "@/lib/firestoreService";

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.onerror = error => reject(error);
});

const formatCountdown = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function VirtualTryOn() {
  const { user } = useAuth();
  const [modelImage, setModelImage] = useState({ file: null, preview: null, data: null, type: null });
  const [garmentImage, setGarmentImage] = useState({ file: null, preview: null, data: null, type: null });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const countdownIntervalRef = useRef(null);
  const modelInputRef = useRef(null);
  const garmentInputRef = useRef(null);

  useEffect(() => {
    const storedLimit = localStorage.getItem("virtualTryOnRateLimit");
    if (storedLimit) {
      const endTime = parseInt(storedLimit, 10);
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      if (remaining > 0) {
        setIsRateLimited(true);
        setRateLimitCountdown(remaining);
        startCountdown(remaining);
      } else {
        localStorage.removeItem("virtualTryOnRateLimit");
      }
    }
    return () => clearInterval(countdownIntervalRef.current);
  }, []);

  const startCountdown = (duration) => {
    setIsRateLimited(true);
    setRateLimitCountdown(duration);
    const endTime = Date.now() + (duration * 1000);
    localStorage.setItem("virtualTryOnRateLimit", endTime.toString());
    clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setRateLimitCountdown(prevTime => {
        if (prevTime <= 1) {
          clearInterval(countdownIntervalRef.current);
          setIsRateLimited(false);
          localStorage.removeItem("virtualTryOnRateLimit");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleImageChange = async (file, setImageState) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      try {
        const data = await toBase64(file);
        setImageState({ file, preview, data, type: file.type });
        setError(null);
      } catch (err) {
        setError("Could not process the selected file.");
      }
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `fitcheck-tryon-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSubmit = async () => {
    if (!modelImage.data || !garmentImage.data) {
      setError("Please upload both images.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setIsSaved(false);

    try {
      const res = await axios.post("/api/ai-virtual-tryon", {
        modelImage: { data: modelImage.data, type: modelImage.type },
        garmentImage: { data: garmentImage.data, type: garmentImage.type },
      });
      if (res.data.success) {
        const { data, mimeType } = res.data.data;
        setGeneratedImage(`data:${mimeType};base64,${data}`);
      } else {
        setError(res.data.error || "An unknown error occurred.");
      }
    } catch (err) {
      if (err.response?.status === 429 && err.response?.data?.rateLimited) {
        startCountdown(12 * 60 * 60);
        setError("Daily limit reached! Try again in 12 hours.");
      } else {
        setError(err.response?.data?.error || "Failed to generate. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!generatedImage || !user?.uid) return;
    setIsSaving(true);
    try {
      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: generatedImage }),
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload image");
      }
      await saveImage(user.uid, uploadData.url, "virtualTryon");
      setIsSaved(true);
    } catch (err) {
      console.error("Failed to save image:", err);
      setError("Failed to save image to gallery.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setModelImage({ file: null, preview: null, data: null, type: null });
    setGarmentImage({ file: null, preview: null, data: null, type: null });
    setGeneratedImage(null);
    setError(null);
    setIsSaved(false);
  };

  const ImageUploadCard = ({ label, icon: Icon, imageState, setImageState, inputRef }) => (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-zinc-500" />
        <span className="text-xs font-semibold text-zinc-700">{label}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleImageChange(e.target.files?.[0], setImageState)}
        className="hidden"
      />
      {!imageState.preview ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex-1 min-h-[140px] border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-zinc-300 hover:bg-zinc-50 transition-all cursor-pointer group"
        >
          <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Upload className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-xs text-zinc-500 font-medium">Click to Upload</span>
        </button>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex-1 min-h-[140px] relative rounded-lg overflow-hidden bg-zinc-100 cursor-pointer group border border-zinc-200"
        >
          <img src={imageState.preview} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white text-xs font-medium">Change</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full w-full flex overflow-hidden">
      {/* Settings Panel - Left Side */}
      <div className="w-80 border-r border-zinc-200 bg-white flex flex-col shrink-0 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-900">Configuration</h2>
          {(modelImage.file || garmentImage.file || generatedImage) && (
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 text-xs text-zinc-500 hover:text-zinc-900">
              Reset
            </Button>
          )}
        </div>

        <div className="flex-1 min-h-0 flex flex-col gap-4">
          <ImageUploadCard
            label="Model Photo"
            icon={User}
            imageState={modelImage}
            setImageState={setModelImage}
            inputRef={modelInputRef}
          />

          <div className="h-px bg-zinc-100 w-full" />

          <ImageUploadCard
            label="Garment Image"
            icon={Shirt}
            imageState={garmentImage}
            setImageState={setGarmentImage}
            inputRef={garmentInputRef}
          />

          <Button
            onClick={handleSubmit}
            disabled={!modelImage.file || !garmentImage.file || isLoading || isRateLimited}
            className="mt-4 w-full h-10 bg-brand-lime text-black hover:bg-brand-lime/90 font-medium shadow-sm transition-all hover:shadow-md"
          >
            {isLoading ? (
              <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" /> Processing...</>
            ) : isRateLimited ? (
              <><Clock className="w-4 h-4 mr-2" /> Wait {formatCountdown(rateLimitCountdown)}</>
            ) : (
              <><Wand2 className="w-4 h-4 mr-2" /> Try On Now</>
            )}
          </Button>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 bg-zinc-50 flex flex-col relative overflow-hidden">
        {!generatedImage ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-zinc-400">
            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
              {isLoading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
              ) : (
                <Sparkles className="w-8 h-8 text-zinc-300" />
              )}
            </div>
            <h3 className="text-zinc-900 font-medium mb-1">
              {isLoading ? "Generating Try-On..." : "Virtual Fitting Room"}
            </h3>
            <p className="text-sm max-w-sm text-center">
              {isLoading ? "This may take 15-30 seconds. We're fitting the garment naturally." : "Upload your photo and a garment to see how it fits instantly."}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10">
            <div className="relative h-full max-h-[80vh] w-auto aspect-[3/4] rounded-lg shadow-lg border-4 border-white bg-white overflow-hidden">
              <img
                src={generatedImage}
                alt="Result"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <Button onClick={handleDownload} variant="outline" className="border-zinc-200 hover:bg-zinc-50 text-zinc-900">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleSaveToGallery} disabled={isSaving || isSaved} className="bg-brand-lime text-black hover:bg-brand-lime/90 font-medium shadow-sm">
                {isSaving ? "Saving..." : isSaved ? <><Check className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save to Gallery</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
