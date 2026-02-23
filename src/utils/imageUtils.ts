// src/utils/imageUtils.ts

/**
 * Utility function to get the correct image URL
 * Handles both full URLs and relative paths (e.g. uploads/products/image.jpg)
 * @param imagePath - The image path from the API (can be relative or absolute)
 * @param apiUrl - The API base URL
 * @returns The complete image URL
 */
export const getImageUrl = (imagePath: string | undefined | null, apiUrl: string): string => {
  if (!imagePath) {
    return '';
  }

  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path, prefix with API URL
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `${apiUrl}/${cleanPath}`;
};
