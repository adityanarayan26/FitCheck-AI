import { NextResponse } from "next/server";

export async function POST(req) {
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        return NextResponse.json(
            { error: "Cloudinary environment variables not configured" },
            { status: 500 }
        );
    }

    try {
        const { imageData } = await req.json();

        if (!imageData) {
            return NextResponse.json(
                { error: "No image data provided" },
                { status: 400 }
            );
        }

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", imageData);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        formData.append("folder", "fitcheck-gallery");

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Cloudinary error:", data);
            return NextResponse.json(
                { error: data.error?.message || "Failed to upload image" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        );
    }
}
