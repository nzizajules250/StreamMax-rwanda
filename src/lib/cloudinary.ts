/**
 * Helper to upload a file directly to Cloudinary from the browser.
 * Supports both images (for thumbnails) and videos (for trailers/movies).
 */
export async function uploadToCloudinary(
  file: File,
  cloudName: string,
  uploadPreset: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Set up upload URL for Cloudinary
    // Cloudinary resource type can be 'auto' to auto-detect image/video/raw
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
    
    xhr.open('POST', url, true);
    
    // Track upload progress
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        const percentage = Math.round((e.loaded * 100) / e.total);
        onProgress(percentage);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.secure_url) {
            resolve(response.secure_url);
          } else {
            reject(new Error('Cloudinary response missing secure_url'));
          }
        } catch (err) {
          reject(new Error('Failed to parse Cloudinary response'));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('Network error during Cloudinary upload'));
    };
    
    // Construct FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    xhr.send(formData);
  });
}
