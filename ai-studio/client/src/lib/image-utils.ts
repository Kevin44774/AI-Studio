export interface ImageDimensions {
  width: number;
  height: number;
}

export async function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function resizeImage(file: File, maxWidth = 1920, maxHeight = 1920, quality = 0.9): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      
      // Calculate new dimensions while maintaining aspect ratio
      let newWidth = width;
      let newHeight = height;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          newWidth = Math.min(width, maxWidth);
          newHeight = newWidth / aspectRatio;
        } else {
          newHeight = Math.min(height, maxHeight);
          newWidth = newHeight * aspectRatio;
        }
      }

      canvas.width = newWidth;
      canvas.height = newHeight;

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw and compress the image
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      const dataUrl = canvas.toDataURL(file.type, quality);
      resolve(dataUrl);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function validateImageFile(file: File): string | null {
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return 'Please upload a PNG or JPG file';
  }

  if (file.size > maxSize) {
    return 'File size must be less than 10MB';
  }

  return null;
}
