import { useState, useCallback } from 'react';
import { UploadedFile } from '@/types/generation';
import { validateImageFile, resizeImage, getImageDimensions, formatFileSize } from '@/lib/image-utils';
import { useToast } from '@/hooks/use-toast';

export function useImageUpload() {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);

    try {
      // Validate file
      const validationError = validateImageFile(file);
      if (validationError) {
        toast({
          title: "Upload Error",
          description: validationError,
          variant: "destructive",
        });
        return;
      }

      // Get original dimensions
      const dimensions = await getImageDimensions(file);
      
      // Resize if necessary
      let dataUrl: string;
      if (dimensions.width > 1920 || dimensions.height > 1920) {
        toast({
          title: "Resizing Image",
          description: "Image will be resized to optimize processing time.",
        });
        dataUrl = await resizeImage(file);
      } else {
        dataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      const uploadedFile: UploadedFile = {
        dataUrl,
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
      };

      setUploadedFile(uploadedFile);
      
      toast({
        title: "Upload Successful",
        description: `${file.name} uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [toast]);

  const clearFile = useCallback(() => {
    setUploadedFile(null);
  }, []);

  return {
    uploadedFile,
    isUploading,
    uploadFile,
    clearFile,
  };
}
