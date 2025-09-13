"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Shirt, Wand2, Plus } from "lucide-react";
import axios from "axios";
import FileUploader from "./FileUploader";

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
      setError(err.response?.data?.error || "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-full p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl">
        <Card className="shadow-lg border-gray-200 dark:border-gray-800">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center mx-auto mb-2">
                 <Wand2 className="h-8 w-8 text-purple-500" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">AI Virtual Try-On</CardTitle>
            <CardDescription>See how clothes look on you before you buy.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

              {/* Step 1: Model Image */}
              <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200">
                      <User className="mr-2 h-6 w-6 text-purple-500"/>
                      <span>Step 1: Your Photo</span>
                  </div>
                  {modelImage.preview ? (
                      <img src={modelImage.preview} alt="Model preview" className="rounded-xl object-cover w-full aspect-[3/4] shadow-md" />
                  ) : (
                      <FileUploader onFileChange={(file) => handleImageChange(file, setModelImage)} title="Upload Your Photo" description="A clear, full-body shot works best."/>
                  )}
              </div>
              
              <div className="hidden lg:flex flex-col items-center justify-center">
                 <Plus className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              </div>


              {/* Step 2: Garment Image */}
              <div className="flex flex-col items-center space-y-4 lg:hidden">
                 <Plus className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              </div>

              <div className="flex flex-col items-center space-y-4">
                  <div className="flex items-center text-lg font-semibold text-gray-800 dark:text-gray-200">
                      <Shirt className="mr-2 h-6 w-6 text-purple-500"/>
                      <span>Step 2: Clothing Item</span>
                  </div>
                   {garmentImage.preview ? (
                      <img src={garmentImage.preview} alt="Garment preview" className="rounded-xl object-cover w-full aspect-[3/4] shadow-md" />
                  ) : (
                      <FileUploader onFileChange={(file) => handleImageChange(file, setGarmentImage)} title="Upload Clothing" description="Use a clear image of the garment."/>
                  )}
              </div>
            </div>

            <div className="mt-8 text-center">
                <Button onClick={handleSubmit} disabled={!modelImage.file || !garmentImage.file || isLoading} size="lg" className="px-10 py-6 text-lg font-bold">
                    {isLoading ? "Generating Your Look..." : (
                        <div className="flex items-center"><Wand2 className="mr-3 h-6 w-6" /> Generate Try-On</div>

                    )}
                </Button>
                {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                 <h3 className="text-2xl font-bold text-center mb-4">Your Virtual Try-On Result</h3>
                 <div className="w-full max-w-md mx-auto aspect-[3/4] bg-gray-100 dark:bg-gray-800/50 rounded-xl flex items-center justify-center shadow-inner">
                    {isLoading && <Skeleton className="w-full h-full rounded-xl" />}
                    {!isLoading && generatedImage && (
                        <img src={generatedImage} alt="Virtual try-on result" className="rounded-xl object-contain w-full h-full" />
                    )}
                    {!isLoading && !generatedImage && (
                       <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                           <Wand2 className="mx-auto h-16 w-16 opacity-50 mb-4" />
                           <p className="font-semibold">Your generated image will appear here.</p>
                       </div>
                    )}
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}