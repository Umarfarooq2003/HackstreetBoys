import { useState } from 'react';
import { Copy, Check, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface FilePreviewProps {
  filename: string;
  content: string;
  language?: string;
}

export const FilePreview = ({ filename, content, language = 'text' }: FilePreviewProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: `${filename} content copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy content to clipboard",
        variant: "destructive"
      });
    }
  };

  const downloadFile = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: `${filename} has been downloaded`,
    });
  };

  const getLanguageBadgeColor = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'dockerfile':
        return 'bg-docker-blue text-docker-blue-foreground';
      case 'yaml':
      case 'yml':
        return 'bg-warning text-warning-foreground';
      case 'json':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const lineCount = content.split('\n').length;

  return (
    <Card className="glass-effect transition-smooth">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {filename}
            <Badge className={getLanguageBadgeColor(language)}>
              {language}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {lineCount} lines
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={copyContent}
              className="transition-smooth"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadFile}
              className="transition-smooth"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <pre className="code-block max-h-96 overflow-auto text-sm leading-relaxed">
            <code className="language-${language}">
              {content.split('\n').map((line, index) => (
                <div key={index} className="flex">
                  <span className="text-muted-foreground text-xs mr-4 select-none min-w-[3ch] text-right">
                    {index + 1}
                  </span>
                  <span className="flex-1">{line || ' '}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};