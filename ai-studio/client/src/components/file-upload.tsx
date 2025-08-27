import { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageUpload } from '@/hooks/use-image-upload';

interface FileUploadProps {
  onFileUploaded: (file: any) => void;
  className?: string;
}

export function FileUpload({ onFileUploaded, className }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { uploadedFile, isUploading, uploadFile, clearFile } = useImageUpload();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  }, [uploadFile]);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/jpg';
    input.onchange = (e) => handleFileInput(e as any);
    input.click();
  }, [handleFileInput]);

  // Notify parent when file is uploaded
  if (uploadedFile && !isUploading) {
    onFileUploaded(uploadedFile);
  }

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center">
            <Upload className="text-primary mr-2 h-5 w-5" />
            Upload Image
          </h2>
          {uploadedFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              data-testid="button-clear-file"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div
          className={cn(
            "border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring hover-lift",
            isDragOver && "drag-over",
            isUploading && "shimmer cursor-not-allowed",
            uploadedFile && "border-primary/30 bg-primary/5"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!isUploading ? handleClick : undefined}
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
              e.preventDefault();
              handleClick();
            }
          }}
          role="button"
          aria-label="Upload image file"
          data-testid="dropzone-upload"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className={cn(
              "w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center transition-all duration-300",
              !isUploading && !uploadedFile && "hover:scale-110",
              isUploading && "breathe"
            )}>
              <Upload className={cn(
                "h-6 w-6 transition-all duration-300",
                uploadedFile ? "text-primary" : "text-muted-foreground",
                isUploading && "animate-pulse"
              )} />
            </div>
            <div>
              {isUploading ? (
                <p className="text-sm font-medium text-foreground">Processing image...</p>
              ) : uploadedFile ? (
                <div className="scale-in">
                  <p className="text-sm font-medium text-primary">✓ {uploadedFile.originalName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-foreground">Drop your image here, or click to browse</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {uploadedFile && (
          <div className="mt-3 p-3 bg-accent/10 border border-accent/20 rounded-md">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-accent rounded-full mr-2" />
              <p className="text-sm text-accent-foreground">
                Image will be automatically resized to 1920px to optimize processing time.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
