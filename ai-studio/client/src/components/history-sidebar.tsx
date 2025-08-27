import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Trash2, Image as ImageIcon } from 'lucide-react';
import { Generation } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';
import { STYLE_OPTIONS, MAX_HISTORY_ITEMS } from '@/types/generation';

interface HistorySidebarProps {
  history: Generation[];
  onHistoryItemClick: (item: Generation) => void;
  onClearHistory: () => void;
  className?: string;
}

export function HistorySidebar({ 
  history, 
  onHistoryItemClick, 
  onClearHistory, 
  className 
}: HistorySidebarProps) {
  const getStyleColor = (style: string) => {
    const styleColors = {
      editorial: 'bg-primary/10 text-primary',
      streetwear: 'bg-accent/10 text-accent',
      vintage: 'bg-orange-500/10 text-orange-600',
      minimalist: 'bg-gray-500/10 text-gray-600',
      cyberpunk: 'bg-green-500/10 text-green-600',
      watercolor: 'bg-blue-500/10 text-blue-600',
    };
    return styleColors[style as keyof typeof styleColors] || 'bg-muted text-muted-foreground';
  };

  const getStyleLabel = (style: string) => {
    return STYLE_OPTIONS.find(option => option.value === style)?.label || style;
  };

  return (
    <Card className={`sticky top-8 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center">
            <History className="text-primary mr-2 h-5 w-5" />
            Recent Generations
          </h2>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearHistory}
              className="text-xs text-muted-foreground hover:text-foreground"
              data-testid="button-clear-history"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-8" data-testid="empty-history">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="text-muted-foreground h-8 w-8" />
              </div>
              <p className="text-sm font-medium text-foreground">No generations yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your recent creations will appear here</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring hover-lift slide-in-right"
                onClick={() => onHistoryItemClick(item)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onHistoryItemClick(item);
                  }
                }}
                role="button"
                aria-label={`Load generation: ${item.prompt.slice(0, 50)}...`}
                data-testid={`history-item-${item.id}`}
              >
                <div className="flex items-start space-x-3">
                  <img
                    src={item.imageUrl}
                    alt={`Generated ${item.style} style image`}
                    className="w-12 h-12 rounded-md object-cover shadow-lg hover:shadow-xl transition-shadow duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEMxOC44OTU0IDIwIDE4IDIwLjg5NTQgMTggMjJDMTggMjMuMTA0NiAxOC44OTU0IDI0IDIwIDI0QzIxLjEwNDYgMjQgMjIgMjMuMTA0NiAyMiAyMkMyMiAyMC44OTU0IDIxLjEwNDYgMjAgMjAgMjBaIiBmaWxsPSIjOUM5QzlDIi8+CjxwYXRoIGQ9Ik0xNiAxNkMxNC44OTU0IDE2IDE0IDE2Ljg5NTQgMTQgMThDMTQgMTkuMTA0NiAxNC44OTU0IDIwIDE2IDIwQzE3LjEwNDYgMjAgMTggMTkuMTA0NiAxOCAxOEMxOCAxNi44OTU0IDE3LjEwNDYgMTYgMTYgMTZaIiBmaWxsPSIjOUM5Qzk0Ii8+Cjwvc3ZnPgo=';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.prompt.length > 30 ? `${item.prompt.slice(0, 30)}...` : item.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getStyleLabel(item.style)} style
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStyleColor(item.style)}`}>
                        {getStyleLabel(item.style)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Storage Used</span>
              <span data-testid="text-storage-used">
                {history.length}/{MAX_HISTORY_ITEMS} slots
              </span>
            </div>
            <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="progress-bar h-1.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(history.length / MAX_HISTORY_ITEMS) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Oldest generations are automatically removed when storage is full
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
