"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Wand2, CheckCircle2, RefreshCw, ZoomIn, Clock, Save, Check } from "lucide-react";
import axios from "axios";
import FileUploader from "./FileUploader";
import { useAuth } from "@/context/AuthContext";
import { saveImage } from "@/lib/firestoreService";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// Format seconds to MM:SS
const formatCountdown = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function ImageAdvisor() {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const countdownIntervalRef = useRef(null);

  // Check for existing rate limit on mount
  useEffect(() => {
    const storedLimit = localStorage.getItem("imageAdvisorRateLimit");
    if (storedLimit) {
      const endTime = parseInt(storedLimit, 10);
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      if (remaining > 0) {
        setIsRateLimited(true);
        setRateLimitCountdown(remaining);
        startCountdown(remaining);
      } else {
        localStorage.removeItem("imageAdvisorRateLimit");
      }
    }
    return () => clearInterval(countdownIntervalRef.current);
  }, []);

  const startCountdown = (duration) => {
    setIsRateLimited(true);
    setRateLimitCountdown(duration);

    // Store end time in localStorage
    const endTime = Date.now() + (duration * 1000);
    localStorage.setItem("imageAdvisorRateLimit", endTime.toString());

    clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
      setRateLimitCountdown(prevTime => {
        if (prevTime <= 1) {
          clearInterval(countdownIntervalRef.current);
          setIsRateLimited(false);
          localStorage.removeItem("imageAdvisorRateLimit");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleFileChange = (file) => {
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      setResponse(null);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setResponse(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    setResponse(null);
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = async () => {
      const base64Image = reader.result.split(",")[1];
      try {
        const res = await axios.post("/api/image-style-advisor", {
          image: base64Image,
          name: image.name,
          type: image.type,
        });
        setResponse(res.data.data);
      } catch (err) {
        // Handle Arcjet rate limit (429)
        if (err.response?.status === 429 && err.response?.data?.rateLimited) {
          startCountdown(2 * 60); // 2 minutes in seconds
          setError("Please wait 2 minutes before analyzing another outfit.");
        } else {
          setError(err.response?.data?.error || "Failed to get advice. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the image file.");
      setIsLoading(false);
    };
  };

  const handleSaveToGallery = async () => {
    if (!image || !user?.uid) return;

    setIsSaving(true);
    try {
      // Convert image file to base64 data URL
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = async () => {
        const base64DataUrl = reader.result;

        // Upload to Cloudinary
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64DataUrl }),
        });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || "Failed to upload image");
        }

        // Save Cloudinary URL to Firestore
        await saveImage(user.uid, uploadData.url, "imageAdvisor", {
          styleAssessment: response?.styleAssessment || null,
        });
        setIsSaved(true);
        setIsSaving(false);
      };
      reader.onerror = () => {
        setError("Failed to save image to gallery.");
        setIsSaving(false);
      };
    } catch (err) {
      console.error("Failed to save image:", err);
      setError("Failed to save image to gallery.");
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500">
            Style Advisor
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            AI-powered fashion advice for your wardrobe
          </p>
        </div>
        {image && (
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            New Upload
          </Button>
        )}
      </div>

      {!image ? (
        /* Upload Screen */
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl md:rounded-3xl shadow-lg shadow-pink-100/50 border border-pink-100/50 p-6 md:p-12 text-center transition-all duration-500 ease-in-out">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-200/30">
              <Sparkles className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Your Outfit</h2>
            <p className="text-gray-500">
              Share a photo of your clothing or complete outfit to receive expert styling tips, color harmony suggestions, and accessory pairings.
            </p>
            <FileUploader
              onFileChange={handleFileChange}
              title="Click to Upload or Drag & Drop"
              description="Supports JPG, PNG, WEBP"
            />
          </div>
        </div>
      ) : (
        /* Analysis Screen */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Left Sidebar: Image & Controls */}
          <div className="md:col-span-4 lg:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3">
              <div className="relative group overflow-hidden rounded-xl aspect-[3/4] bg-gray-50">
                <img
                  src={imagePreview}
                  alt="Outfit"
                  className="w-full h-full object-cover"
                />

                {/* View Image Dialog */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="secondary" className="gap-2 pointer-events-auto shadow-lg">
                        <ZoomIn className="w-3 h-3" /> View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-screen-lg p-0 bg-transparent border-0 shadow-none overflow-hidden flex flex-col items-center justify-center h-screen w-screen focus:outline-none" onOpenAutoFocus={(e) => e.preventDefault()}>
                      <div className="relative w-auto h-auto max-w-[90vw] max-h-[85vh] group">
                        <img
                          src={imagePreview}
                          alt="Full view"
                          className="w-full h-full object-contain rounded-md shadow-2xl bg-black/50"
                        />
                        <DialogClose asChild>
                          <button className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-colors">
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                          </button>
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {!response && !isLoading && !isRateLimited && (
                <Button
                  onClick={handleSubmit}
                  className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Analyze Style
                </Button>
              )}
              {!response && !isLoading && isRateLimited && (
                <Button disabled className="w-full mt-3 bg-gray-400 text-white">
                  <Clock className="w-4 h-4 mr-2" />
                  Wait {formatCountdown(rateLimitCountdown)}
                </Button>
              )}
              {isLoading && (
                <Button disabled className="w-full mt-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Analyzing...
                </Button>
              )}
              {response && !isLoading && (
                <Button
                  onClick={handleSaveToGallery}
                  disabled={isSaving || isSaved}
                  className="w-full mt-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  ) : isSaved ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? "Saving..." : isSaved ? "Saved to Gallery" : "Save to Gallery"}
                </Button>
              )}
            </div>
          </div>

          {/* Right Content: Analysis Results */}
          <div className="md:col-span-8 lg:col-span-9">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                <div className="p-1 bg-red-100 rounded-full shrink-0">!</div>
                {error}
              </div>
            )}

            {isLoading && (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <Skeleton className="h-32 rounded-2xl" />
                  <Skeleton className="h-32 rounded-2xl" />
                </div>
              </div>
            )}

            {!isLoading && !response && !error && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/50 border border-dashed border-gray-200 rounded-3xl text-gray-400">
                <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                <p>Ready to analyze! Click the button to get AI insights.</p>
              </div>
            )}

            {response && !isLoading && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                {/* Assessment Card */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Style Assessment</h3>
                  </div>
                  <div className="prose prose-sm md:prose-base max-w-none text-gray-600">
                    <p className="leading-relaxed">
                      {response.styleAssessment}
                    </p>
                  </div>
                </div>

                {/* Grid for details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-xl">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Color & Review</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                      {response.colorCompositionAnalysis}
                    </p>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-pink-50 rounded-xl">
                        <Sparkles className="w-5 h-5 text-pink-600" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">Styling Tips</h3>
                    </div>
                    <ul className="space-y-4 text-sm text-gray-600">
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900 text-xs uppercase tracking-wider text-pink-600">Accessory</span>
                        <span className="font-medium text-gray-800">{response.stylingRecommendations.accessory}</span>
                      </li>
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900 text-xs uppercase tracking-wider text-purple-600">Why It Works</span>
                        <span>{response.stylingRecommendations.reasoning}</span>
                      </li>
                      <li className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900 text-xs uppercase tracking-wider text-blue-600">Alternative Look</span>
                        <span>{response.stylingRecommendations.alternativeStyling}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}