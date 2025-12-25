"use client";
import { db } from "@/lib/firebaseConfig";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";

/**
 * Save an image to the user's collection in Firestore
 * @param {string} userId - The authenticated user's ID
 * @param {string} imageUrl - Cloudinary URL of the uploaded image
 * @param {"imageAdvisor" | "virtualTryon"} type - Type of image
 * @param {object} metadata - Optional additional metadata
 */
export const saveImage = async (userId, imageUrl, type, metadata = {}) => {
    if (!userId) throw new Error("User ID is required");

    const imagesRef = collection(db, "users", userId, "images");

    const docData = {
        type,
        imageUrl,
        createdAt: serverTimestamp(),
        metadata,
    };

    const docRef = await addDoc(imagesRef, docData);
    return docRef.id;
};

/**
 * Get all images for a user, optionally filtered by type
 * @param {string} userId - The authenticated user's ID
 * @param {"imageAdvisor" | "virtualTryon" | null} type - Optional filter by type
 */
export const getUserImages = async (userId, type = null) => {
    if (!userId) throw new Error("User ID is required");

    const imagesRef = collection(db, "users", userId, "images");

    // Simple query without composite index - filter/sort client-side
    const snapshot = await getDocs(imagesRef);

    let results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
    }));

    // Filter by type client-side
    if (type) {
        results = results.filter((img) => img.type === type);
    }

    // Sort by createdAt descending
    results.sort((a, b) => b.createdAt - a.createdAt);

    return results;
};

/**
 * Delete a specific image from Firestore
 * @param {string} userId - The authenticated user's ID
 * @param {string} imageId - The document ID of the image to delete
 */
export const deleteImage = async (userId, imageId) => {
    if (!userId) throw new Error("User ID is required");
    if (!imageId) throw new Error("Image ID is required");

    const imageRef = doc(db, "users", userId, "images", imageId);
    await deleteDoc(imageRef);
};
