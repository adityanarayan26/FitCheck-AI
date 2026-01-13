"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, Shirt, Trash2, ZoomIn, Images } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserImages, deleteImage } from "@/lib/firestoreService";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
    DialogTitle,
} from "@/components/ui/dialog";

const TabButton = ({ active, onClick, children, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all border ${active
            ? "bg-brand-lime border-brand-lime text-black shadow-sm"
            : "bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
    >
        <Icon className={`w-4 h-4 ${active ? "text-black" : "text-zinc-400"}`} />
        {children}
    </button>
);

export default function ImageGallery() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("imageAdvisor");
    const [images, setImages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        if (user?.uid) {
            loadImages();
        }
    }, [user?.uid, activeTab]);

    const loadImages = async () => {
        if (!user?.uid) return;

        setIsLoading(true);
        try {
            const fetchedImages = await getUserImages(user.uid, activeTab);
            setImages(fetchedImages);
        } catch (err) {
            console.error("Failed to load images:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (imageId) => {
        if (!user?.uid) return;

        setDeletingId(imageId);
        try {
            await deleteImage(user.uid, imageId);
            setImages(images.filter((img) => img.id !== imageId));
        } catch (err) {
            console.error("Failed to delete image:", err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex-1 overflow-hidden flex flex-col h-full bg-zinc-50">
            {/* Header Area */}
            <div className="p-6 md:px-8 md:pt-8 md:pb-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">
                        My Gallery
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Your personal collection of style analyses and virtual try-ons
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    <TabButton
                        active={activeTab === "imageAdvisor"}
                        onClick={() => setActiveTab("imageAdvisor")}
                        icon={Sparkles}
                    >
                        Style Advisor
                    </TabButton>
                    <TabButton
                        active={activeTab === "virtualTryon"}
                        onClick={() => setActiveTab("virtualTryon")}
                        icon={Shirt}
                    >
                        Virtual Try-On
                    </TabButton>
                </div>
            </div>


            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-8">
                {/* Loading State */}
                {isLoading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="aspect-[3/4] rounded-lg bg-zinc-200" />
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && images.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed border-zinc-200 bg-white/50 mt-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
                            <Images className="w-6 h-6 text-zinc-400" />
                        </div>
                        <h3 className="text-zinc-900 font-medium mb-1">No images found</h3>
                        <p className="text-zinc-500 text-sm max-w-sm">
                            {activeTab === "imageAdvisor"
                                ? "Your analyzed outfits will appear here."
                                : "Your virtual try-on results will appear here."}
                        </p>
                    </div>
                )}

                {/* Image Grid */}
                {!isLoading && images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {images.map((img) => (
                            <div
                                key={img.id}
                                className="relative group rounded-lg overflow-hidden bg-white border border-zinc-200 aspect-[3/4] hover:shadow-md transition-all"
                            >
                                <img
                                    src={img.imageUrl}
                                    alt="Saved item"
                                    className="w-full h-full object-cover"
                                />

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    {/* View Dialog */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="secondary"
                                                size="icon"
                                                className="h-9 w-9 bg-white text-zinc-900 hover:bg-zinc-100 border border-zinc-200"
                                            >
                                                <ZoomIn className="w-4 h-4" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 bg-transparent border-0 shadow-none flex items-center justify-center outline-none">
                                            <DialogTitle className="sr-only">Image View</DialogTitle>
                                            <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
                                                <img
                                                    src={img.imageUrl}
                                                    alt="Full view"
                                                    className="max-h-[80vh] w-auto object-contain"
                                                />
                                                <DialogClose asChild>
                                                    <Button className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md rounded-full h-8 w-8 p-0">
                                                        ×
                                                    </Button>
                                                </DialogClose>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Delete Button */}
                                    <Button
                                        onClick={() => handleDelete(img.id)}
                                        disabled={deletingId === img.id}
                                        variant="secondary"
                                        size="icon"
                                        className="h-9 w-9 bg-white text-red-600 hover:bg-red-50 border border-zinc-200"
                                    >
                                        {deletingId === img.id ? (
                                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>

                                {/* Date Badge */}
                                <div className="absolute bottom-2 left-2 right-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-black/60 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded-full">
                                        {new Date(img.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
