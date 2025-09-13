"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";

// Helper to convert file to base64
const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

export default function VirtualTryOnPage() {
  const [modelImage, setModelImage] = useState({ file: null, preview: null, data: null, type: null });
  const [garmentImage, setGarmentImage] = useState({ file: null, preview: null, data: null, type: null });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e, setImageState) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      toBase64(file).then(data => {
        setImageState({ file, preview, data, type: file.type });
      });
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
      if(res.data.success) {
        const { data, mimeType } = res.data.data;
        setGeneratedImage(`data:${mimeType};base64,${data}`);
      } else {
        setError(res.data.error || "An unknown error occurred.");
      }
    } catch (err) {
      console.error("Error generating virtual try-on:", err);
      setError(err.response?.data?.error || "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">AI Virtual Try-On</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              See what you'd look like in any outfit. Upload a photo of yourself and a piece of clothing.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Input Section */}
            <div className="space-y-6">
              <div className="space-y-2">
                  <h3 className="font-semibold">1. Upload Your Photo</h3>
                  <Input id="model-image" type="file" onChange={(e) => handleImageChange(e, setModelImage)} className="w-full" accept="image/*" />
                  {modelImage.preview && <img src={modelImage.preview} alt="Model preview" className="mt-2 rounded-md object-cover w-full h-64" />}
              </div>
               <div className="space-y-2">
                  <h3 className="font-semibold">2. Upload Clothing Image</h3>
                  <Input id="garment-image" type="file" onChange={(e) => handleImageChange(e, setGarmentImage)} className="w-full" accept="image/*" />
                  {garmentImage.preview && <img src={garmentImage.preview} alt="Garment preview" className="mt-2 rounded-md object-cover w-full h-64" />}
              </div>
              <Button onClick={handleSubmit} disabled={!modelImage.file || !garmentImage.file || isLoading} className="w-full">
                {isLoading ? "Generating Your Look..." : "Generate Virtual Try-On"}
              </Button>
               {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </div>

            {/* Output Section */}
            <div className="flex flex-col items-center justify-center space-y-4 h-full">
                <h3 className="font-semibold text-center">Your Virtual Try-On Result</h3>
                <div className="w-full h-[32rem] bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                    {isLoading && <Skeleton className="w-full h-full" />}
                    {!isLoading && generatedImage && (
                        <img src={generatedImage} alt="Virtual try-on result" className="rounded-md object-contain w-full h-full" />
                    )}
                     {!isLoading && !generatedImage && (
                        <p className="text-muted-foreground">Your generated image will appear here.</p>
                     )}
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
