"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

export default function ImageAdvisorPage() {
  const [image, setImage] = useState(null);
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!image) return;
    setIsLoading(true);
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
      } catch (error) {
        console.error("Error analyzing image:", error);
      } finally {
        setIsLoading(false);
      }
    };
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
              <Input type="file" onChange={handleImageChange} className="w-full" />
              <Button onClick={handleSubmit} disabled={!image || isLoading}>
                {isLoading ? "Analyzing..." : "Get Advice"}
              </Button>
            </div>

            {isLoading && (
              <div className="mt-6">
                <Skeleton className="h-8 w-1/ toning-tight mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}

            {response && !isLoading && (
              <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <h3 className="text-lg font-semibold mb-2">Style Assessment:</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{response.styleAssessment}</p>

                <h3 className="text-lg font-semibold mb-2">Color & Composition Analysis:</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{response.colorCompositionAnalysis}</p>

                <h3 className="text-lg font-semibold mb-2">Styling Recommendations:</h3>
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <p><strong>Accessory:</strong> {response.stylingRecommendations.accessory}</p>
                  <p><strong>Reasoning:</strong> {response.stylingRecommendations.reasoning}</p>
                  <p><strong>Alternative:</strong> {response.stylingRecommendations.alternativeStyling}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}