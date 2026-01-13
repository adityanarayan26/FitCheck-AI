import axios from "axios";

const API_ROUTES = {
    STYLE_ADVISOR: "/api/image-style-advisor",
    VIRTUAL_TRY_ON: "/api/ai-virtual-tryon",
};

export const apiService = {
    analyzeStyle: async (file, name, type) => {
        try {
            const response = await axios.post(API_ROUTES.STYLE_ADVISOR, {
                image: file,
                name,
                type,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data?.error || error.message || "An error occurred during style analysis.";
        }
    },

    generateVirtualTryOn: async (modelImage, garmentImage) => {
        try {
            const response = await axios.post(API_ROUTES.VIRTUAL_TRY_ON, {
                modelImage,
                garmentImage,
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw response.data.error || "Virtual try-on failed.";
            }
        } catch (error) {
            throw error.response?.data?.error || error.message || "An error occurred during virtual try-on generation.";
        }
    }
};
