import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wand2, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { GenerationState } from '@/types/generation';

interface GenerateButtonProps {
  onGenerate: () => void;
  onAbort: () => void;
  onRetry: () => void;
  state: GenerationState;
  disabled?: boolean;
  className?: string;
}

export function GenerateButton({ 
  onGenerate, 
  onAbort, 
  onRetry, 
  state, 
  disabled = false, 
  className 
}: GenerateButtonProps) {
  if (state.isLoading) {
    return (
      <Card className={`fade-in ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-muted rounded-full"></div>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full absolute top-0 left-0 spinner"></div>
              <div className="w-20 h-20 border border-primary/20 rounded-full absolute -top-2 -left-2 pulse-ring"></div>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Generating your image...</p>
              <p className="text-sm text-muted-foreground">This usually takes 1-2 seconds</p>
              {state.retryCount > 0 && (
                <p className="text-xs text-accent mt-1" data-testid="text-retry-count">
                  Attempt {state.retryCount + 1}/3
                </p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={onAbort}
              className="text-destructive hover:text-destructive/80 border-destructive/20"
              data-testid="button-abort"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state.error) {
    return (
      <Card className={`bg-destructive/5 border-destructive/20 fade-in ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="text-destructive h-6 w-6" />
            <div>
              <p className="font-semibold text-destructive">Generation Failed</p>
              <p className="text-sm text-destructive/80" data-testid="text-error-message">
                {state.error}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={onRetry}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-retry"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry Now
            </Button>
            <Button
              variant="ghost"
              onClick={onAbort}
              className="text-destructive hover:text-destructive/80"
              data-testid="button-cancel-retry"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`flex justify-center pt-4 ${className}`}>
      <Button
        onClick={onGenerate}
        disabled={disabled}
        className="generate-button text-primary-foreground px-8 py-3 text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="button-generate"
      >
        <Wand2 className="mr-2 h-5 w-5" />
        Generate Image
      </Button>
    </div>
  );
}
