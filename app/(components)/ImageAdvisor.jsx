"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Wand2 } from "lucide-react";
import axios from "axios";
import Typewriter from "./Typewriter";
import FileUploader from "./FileUploader";

export default function ImageAdvisor() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (file) => {
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
      setResponse(null);
    }
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
        setError(err.response?.data?.error || "Failed to get advice. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the image file.");
      setIsLoading(false);
    };
  };

  return (
    <div className="flex justify-center items-start min-h-full p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-5xl">
        <Card className="shadow-lg border-gray-200 dark:border-gray-800">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center mx-auto mb-2">
                 <Wand2 className="h-8 w-8 text-blue-500" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">AI Image Style Advisor</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Left Column for Upload and Preview */}
            <div className="flex flex-col space-y-4">
              <FileUploader onFileChange={handleFileChange} title="Upload Your Outfit" description="Let's see what you're working with!" />
              {imagePreview && (
                <div className="mt-4 rounded-xl overflow-hidden shadow-md border dark:border-gray-700">
                  <img src={imagePreview} alt="Selected preview" className="w-full h-auto object-cover" />
                </div>
              )}
              <Button onClick={handleSubmit} disabled={!image || isLoading} className="w-full py-3 text-md font-semibold">
                {isLoading ? "Analyzing..." : (
                    <div className="flex items-center"><Sparkles className="mr-2 h-5 w-5" /> Get Advice</div>
                )}
              </Button>
              {error && <p className="text-sm text-red-500 text-center pt-2">{error}</p>}
            </div>

            {/* Right Column for AI Response */}
            <div className="w-full min-h-[400px] bg-gray-100 dark:bg-gray-800/50 rounded-xl p-6">
              {isLoading && (
                <div className="space-y-4 pt-2">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-6 w-1/2 mt-6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              )}

              {response && !isLoading && (
                <div className="space-y-6 text-sm text-gray-800 dark:text-gray-200">
                  <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Style Assessment:</h3>
                    <p className="leading-relaxed"><Typewriter text={response.styleAssessment} /></p>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Color & Composition:</h3>
                    <p className="leading-relaxed"><Typewriter text={response.colorCompositionAnalysis} /></p>
                  </div>
                  <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Recommendations:</h3>
                    <div className="space-y-2 leading-relaxed">
                      <p><strong>Accessory:</strong> <Typewriter text={response.stylingRecommendations.accessory} /></p>
                      <p><strong>Reasoning:</strong> <Typewriter text={response.stylingRecommendations.reasoning} /></p>
                      <p><strong>Alternative:</strong> <Typewriter text={response.stylingRecommendations.alternativeStyling} /></p>
                    </div>
                  </div>
                </div>
              )}

              {!isLoading && !response && (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                    <Sparkles className="h-16 w-16 mb-4 opacity-50" />
                    <h3 className="font-semibold text-lg">Your AI style advice will appear here.</h3>
                    <p className="text-sm">Upload an image of your outfit to get started!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}