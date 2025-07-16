import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  RefreshCw, 
  ExternalLink,
  Terminal,
  Play,
  Square
} from 'lucide-react';
import { ProjectData } from './DevOpsAssistant';

interface LivePreviewProps {
  projectData: ProjectData;
}

const LivePreview: React.FC<LivePreviewProps> = ({ projectData }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRunning, setIsRunning] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  const getViewportSize = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '500px' };
    }
  };

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const executeCode = async () => {
    if (projectData.language.includes('Python')) {
      setIsRunning(true);
      setTerminalOutput([]);
      
      const outputs = [
        '$ python app.py',
        ' * Running on http://127.0.0.1:5000',
        ' * Debug mode: on',
        ' * Environment: development',
        'Starting Flask development server...',
        '',
        'API Endpoints:',
        '  GET    /api/tasks',
        '  POST   /api/tasks',
        '  PUT    /api/tasks/<id>',
        '  DELETE /api/tasks/<id>',
        '',
        'Server is ready for connections.',
        '127.0.0.1 - - [' + new Date().toLocaleString() + '] "GET /api/tasks HTTP/1.1" 200 -',
      ];

      for (let i = 0; i < outputs.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setTerminalOutput(prev => [...prev, outputs[i]]);
      }
      
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    setIsRunning(false);
    setTerminalOutput(prev => [...prev, '', '^C KeyboardInterrupt', 'Server stopped.']);
  };

  useEffect(() => {
    if (projectData.code && projectData.language.includes('HTML')) {
      // Create a blob URL for HTML content
      const blob = new Blob([projectData.code], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }

      return () => URL.revokeObjectURL(url);
    }
  }, [projectData.code, projectData.language]);

  const viewport = getViewportSize();

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="w-5 h-5" />
            <span>Live Preview</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-accent/10 text-accent">
              {projectData.language || 'No Code'}
            </Badge>
            <Button variant="outline" size="sm" onClick={refreshPreview}>
              <RefreshCw className="w-3 h-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!projectData.code ? (
          <div className="text-center py-12">
            <Monitor className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Code Generated</h3>
            <p className="text-muted-foreground">
              Generate code first to see the live preview
            </p>
          </div>
        ) : (
          <Tabs defaultValue={projectData.language.includes('Python') ? 'terminal' : 'preview'}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" disabled={projectData.language.includes('Python')}>
                <Monitor className="w-4 h-4 mr-2" />
                Web Preview
              </TabsTrigger>
              <TabsTrigger value="terminal">
                <Terminal className="w-4 h-4 mr-2" />
                Terminal
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              {/* Viewport Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('desktop')}
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('tablet')}
                  >
                    <Tablet className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('mobile')}
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  Open in New Tab
                </Button>
              </div>

              {/* Preview Frame */}
              <div className="bg-muted/30 rounded-lg p-4 flex justify-center">
                <div 
                  className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
                  style={{
                    width: viewport.width,
                    height: viewport.height,
                    maxWidth: '100%'
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0"
                    title="Live Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="terminal" className="space-y-4">
              {/* Terminal Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={executeCode}
                    disabled={isRunning || !projectData.code}
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Run Code
                  </Button>
                  {isRunning && (
                    <Button variant="destructive" onClick={stopExecution} size="sm">
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </Button>
                  )}
                </div>
                <Badge 
                  variant={isRunning ? 'default' : 'secondary'}
                  className={isRunning ? 'bg-status-running text-white' : ''}
                >
                  {isRunning ? 'Running' : 'Stopped'}
                </Badge>
              </div>

              {/* Terminal Output */}
              <div className="bg-terminal-bg rounded-lg p-4 min-h-[300px] font-mono text-sm">
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-border">
                  <div className="w-3 h-3 rounded-full bg-destructive"></div>
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span className="text-muted-foreground ml-2">Terminal</span>
                </div>
                
                {terminalOutput.length === 0 ? (
                  <div className="text-muted-foreground">
                    {projectData.language.includes('Python') 
                      ? 'Click "Run Code" to execute your Python application'
                      : 'Terminal output will appear here'
                    }
                  </div>
                ) : (
                  <div className="space-y-1">
                    {terminalOutput.map((line, index) => (
                      <div 
                        key={index} 
                        className={`${
                          line.startsWith('$') ? 'text-accent font-semibold' :
                          line.includes('ERROR') || line.includes('Error') ? 'text-destructive' :
                          line.includes('WARNING') || line.includes('Warning') ? 'text-warning' :
                          line.includes('SUCCESS') || line.includes('200') ? 'text-success' :
                          'text-foreground'
                        }`}
                      >
                        {line || '\u00A0'}
                      </div>
                    ))}
                    {isRunning && (
                      <div className="text-accent animate-pulse">_</div>
                    )}
                  </div>
                )}
              </div>

              {/* API Documentation for Python */}
              {projectData.language.includes('Python') && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-3">API Endpoints</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-success/10 text-success">GET</Badge>
                      <code>/api/tasks</code>
                      <span className="text-muted-foreground">- Get all tasks</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-accent/10 text-accent">POST</Badge>
                      <code>/api/tasks</code>
                      <span className="text-muted-foreground">- Create new task</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-warning/10 text-warning">PUT</Badge>
                      <code>/api/tasks/&lt;id&gt;</code>
                      <span className="text-muted-foreground">- Update task</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-destructive/10 text-destructive">DELETE</Badge>
                      <code>/api/tasks/&lt;id&gt;</code>
                      <span className="text-muted-foreground">- Delete task</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default LivePreview;