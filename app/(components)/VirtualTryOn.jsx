"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Shirt, Wand2, ArrowRight, Sparkles, Download, ZoomIn, RefreshCw, Trash2 } from "lucide-react";
import axios from "axios";
import FileUploader from "./FileUploader";
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

export default function VirtualTryOn() {
  const [modelImage, setModelImage] = useState({ file: null, preview: null, data: null, type: null });
  const [garmentImage, setGarmentImage] = useState({ file: null, preview: null, data: null, type: null });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const cooldownIntervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(cooldownIntervalRef.current);
  }, []);

  const checkUsageLimit = () => {
    const today = new Date().toISOString().split('T')[0];
    const usageData = localStorage.getItem("virtualTryOnUsage");

    if (usageData) {
      const { count, date } = JSON.parse(usageData);

      if (date !== today) {
        localStorage.setItem("virtualTryOnUsage", JSON.stringify({ count: 1, date: today }));
        return true;
      } else {
        if (count >= 3) {
          setError("Daily limit reached! You can generate 3 try-ons per day.");
          return false;
        }
        localStorage.setItem("virtualTryOnUsage", JSON.stringify({ count: count + 1, date: today }));
        return true;
      }
    } else {
      localStorage.setItem("virtualTryOnUsage", JSON.stringify({ count: 1, date: today }));
      return true;
    }
  };

  const startCooldown = (duration) => {
    setIsCoolingDown(true);
    setCooldownTime(duration);
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownTime(prevTime => {
        if (prevTime <= 1) {
          clearInterval(cooldownIntervalRef.current);
          setIsCoolingDown(false);
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

    // Usage Check
    const allowed = checkUsageLimit();
    if (!allowed) return;

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
        setIsLoading(false);
        startCooldown(10);
      } else {
        setError(res.data.error || "An unknown error occurred.");
        setIsLoading(false);
        startCooldown(5);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate image. Please try again later.");
      setIsLoading(false);
      startCooldown(10);
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
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
            Virtual Try-On
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Visualize how clothes look on you
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Controls & Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Configuration</h3>

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
              disabled={!modelImage.file || !garmentImage.file || isLoading || isCoolingDown}
              className="w-full mt-8 py-6 text-md font-semibold rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg shadow-pink-200 transition-all"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Generating...
                </div>
              ) : isCoolingDown ? (
                <span className="text-sm">Wait {cooldownTime}s</span>
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
