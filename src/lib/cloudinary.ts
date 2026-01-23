export async function uploadToCloudinary(file: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary env vars missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
    }

    if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed.');
    }

    const maxSizeBytes = 5_000_000;
    if (file.size > maxSizeBytes) {
        throw new Error('Image exceeds 5MB limit.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        let message = 'Cloudinary upload failed.';
        try {
            const errorBody = await response.json();
            message = errorBody?.error?.message || message;
        } catch {
            // ignore JSON parse errors
        }
        throw new Error(message);
    }

    const data = await response.json();
    if (!data?.secure_url) {
        throw new Error('Cloudinary upload failed: missing secure_url.');
    }

    return data.secure_url as string;
}
