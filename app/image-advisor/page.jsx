"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiService } from "@/lib/services/api";
import { toBase64, validateFile } from "@/lib/utils/file";

export default function ImageAdvisorPage() {
  const [image, setImage] = useState({ file: null, preview: null });
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setError(null);
    setResponse(null);

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      setImage({ file: null, preview: null });
      return;
    }

    const preview = URL.createObjectURL(file);
    setImage({ file, preview });
  };

  const handleSubmit = async () => {
    if (!image.file) return;
    setIsLoading(true);
    setError(null);

    try {
      const base64Image = await toBase64(image.file);
      const data = await apiService.analyzeStyle(base64Image, image.file.name, image.file.type);
      setResponse(data.data);
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError(typeof err === "string" ? err : "Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">AI Image Style Advisor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Input type="file" onChange={handleImageChange} className="w-full" accept="image/*" />

              {image.preview && (
                <div className="w-full flex justify-center mt-4">
                  <img
                    src={image.preview}
                    alt="Selected style"
                    className="max-h-64 rounded-md object-contain border border-gray-200 dark:border-gray-700 shadow-sm"
                  />
                </div>
              )}

              <Button onClick={handleSubmit} disabled={!image.file || isLoading} className="w-full">
                {isLoading ? "Analyzing Style..." : "Get Advice"}
              </Button>

              {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
            </div>

            {isLoading && (
              <div className="mt-6 space-y-2">
                <Skeleton className="h-4 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mx-auto" />
                <Skeleton className="h-32 w-full mt-4 rounded-md" />
              </div>
            )}

            {response && !isLoading && (
              <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-bottom-2">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-primary">Style Assessment</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{response.styleAssessment}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 text-primary">Color & Composition Analysis</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{response.colorCompositionAnalysis}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary">Styling Recommendations</h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md">
                    <p><strong className="text-gray-900 dark:text-gray-100">Accessory:</strong> {response.stylingRecommendations.accessory}</p>
                    <p><strong className="text-gray-900 dark:text-gray-100">Reasoning:</strong> {response.stylingRecommendations.reasoning}</p>
                    <p><strong className="text-gray-900 dark:text-gray-100">Alternative:</strong> {response.stylingRecommendations.alternativeStyling}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}