import { Card, CardContent } from '@/components/ui/card';
import { Eye, Image, Palette, Clock } from 'lucide-react';
import { UploadedFile } from '@/types/generation';
import { STYLE_OPTIONS } from '@/types/generation';

interface LiveSummaryProps {
  file: UploadedFile | null;
  prompt: string;
  style: string;
  className?: string;
}

export function LiveSummary({ file, prompt, style, className }: LiveSummaryProps) {
  const styleLabel = STYLE_OPTIONS.find(option => option.value === style)?.label || style;

  return (
    <Card className={`bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-primary/20 card-hover ${className}`}>
      <CardContent className="p-6">
        <h3 className="text-md font-semibold text-foreground mb-3 flex items-center">
          <Eye className="text-primary mr-2 h-5 w-5" />
          <span className="gradient-text">Generation Summary</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Image className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Image:</span>
            <span className="font-medium text-foreground" data-testid="text-summary-image">
              {file ? file.originalName : 'No image'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Style:</span>
            <span className="font-medium text-foreground" data-testid="text-summary-style">
              {styleLabel || 'Not selected'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Est. Time:</span>
            <span className="font-medium text-foreground">~2s</span>
          </div>
        </div>
        {prompt && (
          <div className="mt-3 pt-3 border-t border-primary/10">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Prompt:</span>{' '}
              <span data-testid="text-summary-prompt">{prompt}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
