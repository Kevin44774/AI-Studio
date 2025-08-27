import { Card, CardContent } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import { UploadedFile } from '@/types/generation';
import { formatFileSize } from '@/lib/image-utils';

interface ImagePreviewProps {
  file: UploadedFile | null;
  className?: string;
}

export function ImagePreview({ file, className }: ImagePreviewProps) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Eye className="text-primary mr-2 h-5 w-5" />
          Preview
        </h2>
        
        <div className="bg-gradient-to-br from-muted/50 to-muted rounded-lg p-8 min-h-[300px] flex items-center justify-center relative overflow-hidden">
          {file ? (
            <img
              src={file.dataUrl}
              alt="Uploaded preview"
              className="max-w-full max-h-[400px] rounded-lg shadow-2xl object-contain scale-in hover:scale-105 transition-transform duration-300"
              data-testid="img-preview"
            />
          ) : (
            <div className="text-center text-muted-foreground fade-in" data-testid="text-no-image">
              <div className="w-16 h-16 bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4 float">
                <Eye className="h-8 w-8" />
              </div>
              <p>No image uploaded</p>
            </div>
          )}
        </div>

        {file && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-center fade-in-delayed">
            <div className="p-3 bg-gradient-to-br from-muted/80 to-muted rounded-lg hover-lift">
              <p className="text-xs text-muted-foreground">Format</p>
              <p className="text-sm font-medium text-foreground" data-testid="text-format">
                {file.mimeType.split('/')[1].toUpperCase()}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-muted/80 to-muted rounded-lg hover-lift">
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium text-foreground truncate" data-testid="text-filename">
                {file.originalName}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-br from-muted/80 to-muted rounded-lg hover-lift">
              <p className="text-xs text-muted-foreground">File Size</p>
              <p className="text-sm font-medium text-foreground" data-testid="text-filesize">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
