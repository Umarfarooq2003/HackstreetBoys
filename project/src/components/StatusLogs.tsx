import { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  timestamp: Date;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface StatusLogsProps {
  logs: LogEntry[];
}

export const StatusLogs = ({ logs }: StatusLogsProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-info';
    }
  };

  const getLevelBadgeVariant = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const copyLogs = async () => {
    const logText = logs
      .map(log => `[${log.timestamp.toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}`)
      .join('\n');
    
    try {
      await navigator.clipboard.writeText(logText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Logs copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy logs to clipboard",
        variant: "destructive"
      });
    }
  };

  const displayedLogs = isExpanded ? logs : logs.slice(-3);

  return (
    <Card className="glass-effect transition-smooth">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Process Logs
            <Badge variant="outline" className="ml-2">
              {logs.length} entries
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyLogs}
              className="transition-smooth"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            {logs.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="transition-smooth"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show All
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {displayedLogs.map((log, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50 transition-smooth hover:bg-muted/70"
            >
              <Badge 
                variant={getLevelBadgeVariant(log.level)}
                className="text-xs min-w-[60px] justify-center mt-0.5"
              >
                {log.level.toUpperCase()}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono break-words">
                  <span className="text-muted-foreground text-xs">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>
                  <span className={`ml-2 ${getLevelColor(log.level)}`}>
                    {log.message}
                  </span>
                </p>
              </div>
            </div>
          ))}
          
          {!isExpanded && logs.length > 3 && (
            <div className="text-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="text-muted-foreground hover:text-foreground transition-smooth"
              >
                +{logs.length - 3} more entries
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};