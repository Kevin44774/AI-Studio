import { useState, useCallback, useEffect } from 'react';
import { Bell, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/file-upload';
import { ImagePreview } from '@/components/image-preview';
import { GenerationControls } from '@/components/generation-controls';
import { LiveSummary } from '@/components/live-summary';
import { GenerateButton } from '@/components/generate-button';
import { HistorySidebar } from '@/components/history-sidebar';
import { useGeneration } from '@/hooks/use-generation';
import { useHistory } from '@/hooks/use-history';
import { UploadedFile } from '@/types/generation';
import { Generation } from '@shared/schema';

interface FormData {
  prompt: string;
  style: string;
  creativity: number;
  strength: number;
}

export default function Studio() {
  useEffect(() => {
    document.title = 'AI Studio - Creative Generation Platform';
  }, []);
  
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    prompt: '',
    style: '',
    creativity: 75,
    strength: 60,
  });

  const { generate, abort, retry, ...generationState } = useGeneration();
  const { history, addToHistory, clearHistory } = useHistory();

  const handleFileUploaded = useCallback((file: UploadedFile) => {
    setUploadedFile(file);
  }, []);

  const handleFormChange = useCallback((data: FormData) => {
    setFormData(data);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!uploadedFile || !formData.prompt || !formData.style) {
      return;
    }

    const result = await generate({
      imageDataUrl: uploadedFile.dataUrl,
      prompt: formData.prompt,
      style: formData.style as any,
    });

    if (result) {
      addToHistory(result);
    }
  }, [uploadedFile, formData, generate, addToHistory]);

  const handleRetry = useCallback(() => {
    retry({
      imageDataUrl: uploadedFile!.dataUrl,
      prompt: formData.prompt,
      style: formData.style as any,
    });
  }, [uploadedFile, formData, retry]);

  const handleHistoryItemClick = useCallback((item: Generation) => {
    // Restore the generation to the workspace
    setUploadedFile({
      dataUrl: item.originalImageUrl,
      originalName: 'restored-image.jpg',
      size: 0,
      mimeType: 'image/jpeg',
    });
    setFormData(prev => ({
      ...prev,
      prompt: item.prompt,
      style: item.style,
    }));
  }, []);

  const canGenerate = uploadedFile && formData.prompt && formData.style && !generationState.isLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3 fade-in">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                <Sparkles className="text-primary-foreground h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold gradient-text">AI Studio</h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6 fade-in-delayed">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-200">
                Gallery
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-200">
                Pricing
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:scale-105 transition-all duration-200">
                Help
              </Button>
            </nav>

            <div className="flex items-center space-x-3 fade-in-delayed-2">
              <Button variant="ghost" size="sm" className="relative text-muted-foreground hover:text-foreground hover:scale-110 transition-all duration-200">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse"></span>
              </Button>
              <div className="w-8 h-8 bg-gradient-to-br from-muted to-muted/60 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer">
                <User className="text-muted-foreground h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Workspace */}
          <div className="lg:col-span-8 space-y-6">
            <div className="fade-in">
              <FileUpload onFileUploaded={handleFileUploaded} />
            </div>
            
            <div className="fade-in-delayed">
              <ImagePreview file={uploadedFile} />
            </div>
            
            <div className="fade-in-delayed-2">
              <GenerationControls onFormChange={handleFormChange} />
            </div>
            
            <div className="fade-in-delayed">
              <LiveSummary
                file={uploadedFile}
                prompt={formData.prompt}
                style={formData.style}
              />
            </div>
            
            <div className="fade-in-delayed-2">
              <GenerateButton
                onGenerate={handleGenerate}
                onAbort={abort}
                onRetry={handleRetry}
                state={generationState}
                disabled={!canGenerate}
              />
            </div>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-4 fade-in-delayed">
            <HistorySidebar
              history={history}
              onHistoryItemClick={handleHistoryItemClick}
              onClearHistory={clearHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
