import { NextResponse } from "next/server";

export async function POST(req) {
    console.log("📷 Upload Request Received. Content-Length:", req.headers.get("content-length"));

    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

    // We only strictly need Cloud Name and Preset for Unsigned uploads
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        console.error("Missing Cloudinary env vars");
        return NextResponse.json(
            { error: "Cloudinary environment variables not configured" },
            { status: 500 }
        );
    }

    try {
        console.log("Parsing request JSON...");
        const { imageData } = await req.json();
        console.log("JSON Parsed. Image Data length:", imageData ? imageData.length : 'null');

        if (!imageData) {
            return NextResponse.json(
                { error: "No image data provided" },
                { status: 400 }
            );
        }

        // Upload to Cloudinary (Unsigned)
        const formData = new FormData();
        formData.append("file", imageData);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        console.log(`Uploading to Cloudinary (Unsigned). Cloud: ${CLOUDINARY_CLOUD_NAME}, Preset: ${CLOUDINARY_UPLOAD_PRESET}`);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Cloudinary error details:", JSON.stringify(data, null, 2));
            // Check if it's a 413 from Cloudinary
            if (response.status === 413) {
                return NextResponse.json(
                    { error: { code: "413", message: "Image too large for Cloudinary (limit is usually 10MB)" } },
                    { status: 413 }
                );
            }
            return NextResponse.json(
                { error: data.error?.message || "Failed to upload image to Cloudinary" },
                { status: response.status }
            );
        }

        console.log("Upload Success:", data.secure_url);
        return NextResponse.json({
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
        });
    } catch (error) {
        console.error("Upload error exception:", error);
        return NextResponse.json(
            { error: "Failed to upload image: " + error.message, details: error.toString() },
            { status: 500 }
        );
    }
}
