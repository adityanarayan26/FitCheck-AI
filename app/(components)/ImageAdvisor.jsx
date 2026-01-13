"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, RefreshCw, Clock, Save, Check, Upload, Palette, Lightbulb } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { saveImage } from "@/lib/firestoreService";

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
  const fileInputRef = useRef(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      setResponse(null);
      setIsSaved(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setImagePreview(null);
    setResponse(null);
    setError(null);
    setIsSaved(false);
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
        if (err.response?.status === 429 && err.response?.data?.rateLimited) {
          startCountdown(2 * 60);
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
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = async () => {
        const base64DataUrl = reader.result;
        const uploadRes = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: base64DataUrl }),
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || "Failed to upload image");
        }
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
    <div className="h-full w-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
      {/* Quick sidebar for actions - Left Side */}
      <div className="w-full md:w-80 h-auto md:h-full border-b md:border-b-0 md:border-r border-zinc-200 bg-white flex flex-col shrink-0 overflow-visible md:overflow-visible">
        <div className="p-4 border-b border-zinc-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-zinc-900">Input</h2>
            {image && (
              <Button variant="ghost" size="icon" onClick={handleReset} className="h-6 w-6 text-zinc-400 hover:text-zinc-600">
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {!imagePreview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-square md:aspect-[3/4] rounded-lg border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-2 hover:bg-zinc-100 hover:border-zinc-300 transition-all group"
            >
              <div className="h-10 w-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-700">Upload Outfit</p>
                <p className="text-[10px] text-zinc-400">JPG, PNG, WEBP</p>
              </div>
            </button>
          ) : (
            <div className="w-full aspect-square md:aspect-[3/4] relative rounded-lg overflow-hidden bg-zinc-100 group border border-zinc-200">
              <img src={imagePreview} alt="Outfit" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Change Image
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-2">
            {!response && !isLoading && (
              <Button
                onClick={handleSubmit}
                disabled={!image || isRateLimited}
                className="w-full bg-brand-lime text-black hover:bg-brand-lime/90 hover:shadow-lg transition-all font-medium"
              >
                {isRateLimited ? (
                  <><Clock className="w-4 h-4 mr-2" /> Wait {formatCountdown(rateLimitCountdown)}</>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" /> Analyze Style</>
                )}
              </Button>
            )}

            {isLoading && (
              <Button disabled className="w-full bg-zinc-100 text-zinc-400 border border-zinc-200">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent mr-2" />
                Analyzing...
              </Button>
            )}

            {response && (
              <Button
                onClick={handleSaveToGallery}
                disabled={isSaving || isSaved}
                variant={isSaved ? "outline" : "default"}
                className={`w-full font-medium transition-all ${isSaved ? "border-green-200 text-green-700 bg-green-50" : "bg-brand-lime text-black hover:bg-brand-lime/90 shadow-sm"}`}
              >
                {isSaving ? "Saving..." : isSaved ? <><Check className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Results</>}
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 shrink-0 md:flex-1 md:overflow-y-auto">
          <div className="text-xs text-zinc-500 leading-relaxed">
            <p className="font-medium text-zinc-900 mb-1">How it works</p>
            <p>Upload a clear photo of your outfit. Our AI will analyze color harmony, style coherence, and provide actionable tips.</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-zinc-50 flex flex-col overflow-hidden relative">
        {error && (
          <div className="absolute top-4 left-4 right-4 z-10 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-center shadow-sm max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {!response ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400">
            <div className="h-16 w-16 mb-4 rounded-2xl bg-zinc-100 flex items-center justify-center">
              {isLoading ? (
                <Sparkles className="w-8 h-8 text-zinc-400 animate-pulse" />
              ) : (
                <Wand2 className="w-8 h-8 text-zinc-300" />
              )}
            </div>
            <h3 className="text-zinc-900 font-medium mb-1">
              {isLoading ? "Analyzing your style..." : "Ready to analyze"}
            </h3>
            <p className="text-sm max-w-xs text-center">
              {isLoading ? "This usually takes about 5-10 seconds." : "Your results will appear here after analysis."}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Style Assessment - Hero Card */}
              <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-zinc-900" />
                  <h3 className="text-lg font-semibold text-zinc-900">Style Assessment</h3>
                </div>
                <p className="text-zinc-600 leading-relaxed">
                  {response.styleAssessment}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Color Analysis */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-zinc-900" />
                    <h3 className="font-semibold text-zinc-900">Color Palette</h3>
                  </div>
                  <p className="text-sm text-zinc-600 leading-relaxed flex-1">
                    {response.colorCompositionAnalysis}
                  </p>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-lg border border-zinc-200 p-6 shadow-sm flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-zinc-900" />
                    <h3 className="font-semibold text-zinc-900">Key Insights</h3>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Best Accessory</span>
                      <span className="text-zinc-800">{response.stylingRecommendations.accessory}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Why it works</span>
                      <span className="text-zinc-800">{response.stylingRecommendations.reasoning}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Alternative Look</span>
                      <span className="text-zinc-800">{response.stylingRecommendations.alternativeStyling}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}