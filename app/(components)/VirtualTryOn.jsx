"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Shirt, Wand2, ArrowRight, Sparkles, Download, ZoomIn, RefreshCw, Trash2, Clock, Save, Check } from "lucide-react";
import axios from "axios";
import FileUploader from "./FileUploader";
import { useAuth } from "@/context/AuthContext";
import { saveImage } from "@/lib/firestoreService";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result.split(',')[1]);
  reader.onerror = error => reject(error);
});

// Format seconds to HH:MM:SS
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

  // Check for existing rate limit on mount
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

    // Store end time in localStorage
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

  const handleImageChange = (file, setImageState) => {
    if (file) {
      const preview = URL.createObjectURL(file);
      toBase64(file).then(data => {
        setImageState({ file, preview, data, type: file.type });
      }).catch(err => {
        setError("Could not process the selected file.");
      });
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
      setError("Please upload both a model and a garment image.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

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
      // Handle Arcjet rate limit (429)
      if (err.response?.status === 429 && err.response?.data?.rateLimited) {
        startCountdown(12 * 60 * 60); // 12 hours in seconds
        setError("Daily limit reached! You can try on 3 outfits every 12 hours.");
      } else {
        setError(err.response?.data?.error || "Failed to generate image. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!generatedImage || !user?.uid) return;

    setIsSaving(true);
    try {
      // Upload to Cloudinary
      const uploadRes = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: generatedImage }),
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload image");
      }

      // Save Cloudinary URL to Firestore
      await saveImage(user.uid, uploadData.url, "virtualTryon");
      setIsSaved(true);
    } catch (err) {
      console.error("Failed to save image:", err);
      setError("Failed to save image to gallery.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to render compact preview
  const RenderCompactPreview = ({ imageState, setImageState, label, icon: Icon }) => (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-500" /> {label}
      </label>
      {imageState.preview ? (
        <div className="relative group w-32 h-40 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-sm shrink-0">
          <img src={imageState.preview} alt={label} className="w-full h-full object-cover" />
          <button
            onClick={() => setImageState({ file: null, preview: null, data: null, type: null })}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="w-full">
          <FileUploader
            onFileChange={(file) => handleImageChange(file, setImageState)}
            title={label}
            description="Upload Image"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400">
            Virtual Try-On
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            See how outfits look on you instantly
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
        {/* Left Col: Controls & Inputs */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <div className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg shadow-fuchsia-100/50 border border-fuchsia-100/50">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">Configuration</h3>

            <div className="space-y-6">
              <RenderCompactPreview
                imageState={modelImage}
                setImageState={setModelImage}
                label="Your Photo"
                icon={User}
              />

              <div className="h-px bg-gray-100" />

              <RenderCompactPreview
                imageState={garmentImage}
                setImageState={setGarmentImage}
                label="Garment"
                icon={Shirt}
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!modelImage.file || !garmentImage.file || isLoading || isRateLimited}
              className="w-full mt-8 py-6 text-md font-semibold rounded-xl bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 hover:from-fuchsia-600 hover:via-pink-600 hover:to-amber-500 text-white shadow-lg shadow-fuchsia-200/50 transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Generating...
                </div>
              ) : isRateLimited ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Available in {formatCountdown(rateLimitCountdown)}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Try On Now
                </div>
              )}
            </Button>
            {error && <p className="text-xs text-red-500 mt-3 bg-red-50 p-2 rounded-lg">{error}</p>}
          </div>
        </div>

        {/* Right Col: Result Area */}
        <div className="lg:col-span-8">
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100 h-full min-h-[500px] flex flex-col items-center justify-center relative bg-grid-slate-50">

            {/* Placeholder */}
            {!isLoading && !generatedImage && (
              <div className="text-center text-gray-400 max-w-sm">
                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-pink-300" />
                </div>
                <h3 className="text-gray-900 font-semibold text-lg mb-2">Ready to Create Magic</h3>
                <p className="text-sm">Upload your photo and a garment to start the virtual try-on experience.</p>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="text-center">
                <div className="mb-8 relative">
                  <div className="h-24 w-24 animate-spin rounded-full border-4 border-pink-100 border-t-pink-500 mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-pink-500 animate-pulse" />
                  </div>
                </div>
                <p className="text-gray-600 font-medium">Synthesizing your look...</p>
                <p className="text-gray-400 text-sm mt-1">This may take a few seconds</p>
              </div>
            )}

            {/* Result Image */}
            {!isLoading && generatedImage && (
              <div className="w-full max-w-md animate-in zoom-in-50 duration-500">
                <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-[3/4] bg-gray-100 cursor-pointer">
                  <img src={generatedImage} alt="Generated Try-On" className="w-full h-full object-cover" />

                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 backdrop-blur-sm">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="rounded-full h-12 w-12 p-0 shadow-lg hover:scale-110 transition-transform">
                          <ZoomIn className="w-5 h-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-transparent border-0 shadow-none flex flex-col items-center justify-center gap-4 focus:outline-none">
                        <div className="relative rounded-lg overflow-hidden shadow-2xl">
                          <img
                            src={generatedImage}
                            alt="Full Screen Result"
                            className="max-w-full max-h-[85vh] object-contain bg-white rounded-lg" // Added bg-white for transparent PNGs
                          />
                        </div>
                        <Button onClick={handleDownload} className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl rounded-full px-8">
                          <Download className="w-4 h-4 mr-2" /> Download Image
                        </Button>
                      </DialogContent>
                    </Dialog>

                    <Button onClick={handleDownload} variant="secondary" className="rounded-full h-12 w-12 p-0 shadow-lg hover:scale-110 transition-transform">
                      <Download className="w-5 h-5" />
                    </Button>

                    <Button
                      onClick={handleSaveToGallery}
                      disabled={isSaving || isSaved}
                      variant="secondary"
                      className="rounded-full h-12 w-12 p-0 shadow-lg hover:scale-110 transition-transform"
                    >
                      {isSaving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                      ) : isSaved ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
