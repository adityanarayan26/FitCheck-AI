export const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

export const validateFile = (file, options = {}) => {
    const { maxSizeMB = 5, acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'] } = options;

    if (!file) return { valid: false, error: 'No file selected' };

    if (!acceptedTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid file type. Please upload an image.' };
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        return { valid: false, error: `File size too large. Max size is ${maxSizeMB}MB.` };
    }

    return { valid: true };
};
