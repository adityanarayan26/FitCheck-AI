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
} from "@/components/ui/dialog";

const TabButton = ({ active, onClick, children, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${active
            ? "bg-white shadow-sm text-gray-900"
            : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
            }`}
    >
        <Icon className="w-4 h-4" />
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
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
                        My Gallery
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
                        View your saved style analyses and virtual try-ons
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-100/80 p-1 md:p-1.5 rounded-xl md:rounded-2xl inline-flex gap-1 mb-6 md:mb-8">
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

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && images.length === 0 && (
                <div className="text-center py-16 bg-white/50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Images className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-gray-900 font-semibold mb-2">No images saved yet</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                        {activeTab === "imageAdvisor"
                            ? "Analyze an outfit and click 'Save to Gallery' to see it here."
                            : "Generate a virtual try-on and save it to see it here."}
                    </p>
                </div>
            )}

            {/* Image Grid */}
            {!isLoading && images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className="relative group rounded-2xl overflow-hidden bg-gray-100 aspect-[3/4] shadow-sm hover:shadow-lg transition-all"
                        >
                            <img
                                src={img.imageUrl}
                                alt="Saved outfit"
                                className="w-full h-full object-cover"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                                {/* View Dialog */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            className="rounded-full h-10 w-10 p-0 shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-transparent border-0 shadow-none flex flex-col items-center justify-center gap-4 focus:outline-none">
                                        <div className="relative rounded-lg overflow-hidden shadow-2xl">
                                            <img
                                                src={img.imageUrl}
                                                alt="Full view"
                                                className="max-w-full max-h-[85vh] object-contain bg-white rounded-lg"
                                            />
                                        </div>
                                        <DialogClose asChild>
                                            <Button className="bg-white text-gray-900 hover:bg-gray-100 shadow-xl rounded-full px-8">
                                                Close
                                            </Button>
                                        </DialogClose>
                                    </DialogContent>
                                </Dialog>

                                {/* Delete Button */}
                                <Button
                                    onClick={() => handleDelete(img.id)}
                                    disabled={deletingId === img.id}
                                    variant="secondary"
                                    className="rounded-full h-10 w-10 p-0 shadow-lg hover:scale-110 transition-transform hover:bg-red-100"
                                >
                                    {deletingId === img.id ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    )}
                                </Button>
                            </div>

                            {/* Date Badge */}
                            <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                                {new Date(img.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
