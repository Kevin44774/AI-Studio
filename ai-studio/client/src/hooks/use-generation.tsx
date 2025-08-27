import { useState, useCallback, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Generation, CreateGenerationRequest } from '@shared/schema';
import { GenerationState, MAX_RETRY_COUNT } from '@/types/generation';
import { useToast } from '@/hooks/use-toast';

const RETRY_DELAYS = [2000, 4000, 8000]; // Exponential backoff delays

export function useGeneration() {
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    error: null,
    retryCount: 0,
    abortController: null,
  });
  
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: CreateGenerationRequest) => {
      const response = await apiRequest('POST', '/api/generate', data);
      return response.json() as Promise<Generation>;
    },
    onError: (error: any) => {
      console.error('Generation error:', error);
    },
  });

  const generate = useCallback(async (data: CreateGenerationRequest): Promise<Generation | null> => {
    if (state.isLoading) return null;

    const abortController = new AbortController();
    
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      retryCount: 0,
      abortController,
    }));

    const attemptGeneration = async (attemptCount: number): Promise<Generation | null> => {
      try {
        // Check if operation was aborted
        if (abortController.signal.aborted) {
          return null;
        }

        setState(prev => ({ ...prev, retryCount: attemptCount }));

        const result = await generateMutation.mutateAsync(data);
        
        // Success - reset state
        setState({
          isLoading: false,
          error: null,
          retryCount: 0,
          abortController: null,
        });

        toast({
          title: "Generation Complete!",
          description: "Your image has been successfully transformed.",
        });

        return result;
      } catch (error: any) {
        console.error(`Generation attempt ${attemptCount + 1} failed:`, error);

        // Check if operation was aborted
        if (abortController.signal.aborted) {
          return null;
        }

        const isLastAttempt = attemptCount >= MAX_RETRY_COUNT - 1;
        const errorMessage = error?.message || 'Generation failed';

        if (isLastAttempt) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: errorMessage,
            abortController: null,
          }));

          toast({
            title: "Generation Failed",
            description: `Failed after ${MAX_RETRY_COUNT} attempts: ${errorMessage}`,
            variant: "destructive",
          });

          return null;
        } else {
          // Schedule retry with exponential backoff
          const retryDelay = RETRY_DELAYS[attemptCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
          
          setState(prev => ({
            ...prev,
            error: `${errorMessage} - Retrying in ${retryDelay / 1000} seconds... (Attempt ${attemptCount + 2}/${MAX_RETRY_COUNT})`,
          }));

          return new Promise((resolve) => {
            retryTimeoutRef.current = setTimeout(async () => {
              if (!abortController.signal.aborted) {
                const result = await attemptGeneration(attemptCount + 1);
                resolve(result);
              } else {
                resolve(null);
              }
            }, retryDelay);
          });
        }
      }
    };

    return attemptGeneration(0);
  }, [state.isLoading, generateMutation, toast]);

  const abort = useCallback(() => {
    if (state.abortController) {
      state.abortController.abort();
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    setState({
      isLoading: false,
      error: null,
      retryCount: 0,
      abortController: null,
    });

    toast({
      title: "Generation Cancelled",
      description: "The generation request has been cancelled.",
    });
  }, [state.abortController, toast]);

  const retry = useCallback((data: CreateGenerationRequest) => {
    setState(prev => ({
      ...prev,
      error: null,
    }));
    return generate(data);
  }, [generate]);

  return {
    ...state,
    generate,
    abort,
    retry,
  };
}
