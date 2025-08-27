import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { Settings, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { STYLE_OPTIONS } from '@/types/generation';

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(500, "Prompt must be 500 characters or less"),
  style: z.string().min(1, "Style is required"),
  creativity: z.number().min(0).max(100).default(75),
  strength: z.number().min(0).max(100).default(60),
});

type FormData = z.infer<typeof formSchema>;

interface GenerationControlsProps {
  onFormChange: (data: FormData) => void;
  className?: string;
}

export function GenerationControls({ onFormChange, className }: GenerationControlsProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      style: "",
      creativity: 75,
      strength: 60,
    },
  });

  const watchedValues = form.watch();

  // Notify parent of form changes
  useEffect(() => {
    if (form.formState.isValid || (watchedValues.prompt && watchedValues.style)) {
      onFormChange(watchedValues);
    }
  }, [watchedValues, form.formState.isValid, onFormChange]);

  return (
    <Card className={`card-hover ${className}`}>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <Settings className="text-primary mr-2 h-5 w-5" />
          Generation Settings
        </h2>
        
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Prompt <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Describe the style transformation you want..."
                      className="resize-none"
                      data-testid="textarea-prompt"
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormDescription>
                      Be specific for better results
                    </FormDescription>
                    <span className="text-xs text-muted-foreground" data-testid="text-character-count">
                      {field.value?.length || 0}/500
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Style <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-style">
                        <SelectValue placeholder="Select a style..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STYLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto font-medium text-foreground hover:text-primary"
                  data-testid="button-advanced-options"
                >
                  <span>Advanced Options</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4 pl-4 border-l-2 border-muted">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="creativity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Creativity</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                            data-testid="slider-creativity"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Conservative</span>
                          <span>Creative</span>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="strength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Strength</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                            data-testid="slider-strength"
                          />
                        </FormControl>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Subtle</span>
                          <span>Bold</span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
