import { useState } from 'react';
import { GitBranch, Container, Download, FileText, Zap, CheckCircle, AlertCircle, Loader2, Rocket, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { HeroSection } from '@/components/HeroSection';
import { StatusLogs } from '@/components/StatusLogs';
import { FilePreview } from '@/components/FilePreview';
import { TechStackDetector } from '@/utils/techStackDetector';
import { DockerfileGenerator } from '@/utils/dockerfileGenerator';
import { ConfigGenerator } from '@/utils/configGenerator';
import { DeploymentService, DeploymentStatus } from '@/utils/deploymentService';

interface GeneratedFiles {
  dockerfile: string;
  dockerCompose?: string;
  config: string;
  explanation: string;
}

interface ProcessingStatus {
  step: 'idle' | 'cloning' | 'analyzing' | 'generating' | 'validating' | 'complete' | 'error';
  message: string;
  progress: number;
}

const Index = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState<ProcessingStatus>({ step: 'idle', message: '', progress: 0 });
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles | null>(null);
  const [logs, setLogs] = useState<Array<{ timestamp: Date; level: 'info' | 'success' | 'warning' | 'error'; message: string }>>([]);
  const [detectedTechStack, setDetectedTechStack] = useState<string[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({ step: 'idle', message: '', progress: 0 });
  const [deploymentUrl, setDeploymentUrl] = useState<string>('');
  const { toast } = useToast();

  const addLog = (level: 'info' | 'success' | 'warning' | 'error', message: string) => {
    setLogs(prev => [...prev, { timestamp: new Date(), level, message }]);
  };

  const validateGitHubUrl = (url: string): boolean => {
    const githubRegex = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    return githubRegex.test(url);
  };

  const updateStatus = (step: ProcessingStatus['step'], message: string, progress: number) => {
    setStatus({ step, message, progress });
    addLog(step === 'error' ? 'error' : 'info', message);
  };

  const simulateProcessing = async () => {
    if (!validateGitHubUrl(repoUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive"
      });
      return;
    }

    // Clear previous results
    setGeneratedFiles(null);
    setLogs([]);
    setDetectedTechStack([]);

    try {
      // Step 1: Cloning
      updateStatus('cloning', `Cloning repository: ${repoUrl}`, 20);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Analyzing
      updateStatus('analyzing', 'Analyzing repository structure and detecting tech stack...', 40);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate tech stack detection
      const techStack = TechStackDetector.detectFromUrl(repoUrl);
      setDetectedTechStack(techStack);
      addLog('success', `Detected tech stack: ${techStack.join(', ')}`);

      // Step 3: Generating
      updateStatus('generating', 'Generating Dockerfile and configuration files...', 60);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate files
      const dockerfile = DockerfileGenerator.generate(techStack[0] || 'node');
      const config = ConfigGenerator.generate(techStack[0] || 'node');
      const dockerCompose = techStack.length > 1 ? ConfigGenerator.generateDockerCompose(techStack) : undefined;

      // Step 4: Validating
      updateStatus('validating', 'Validating container configuration...', 80);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: Complete
      updateStatus('complete', 'Containerization files generated successfully!', 100);
      
      const files: GeneratedFiles = {
        dockerfile,
        dockerCompose,
        config,
        explanation: `Successfully analyzed the repository and detected a ${techStack[0]} application. Generated optimized Dockerfile with multi-stage build, security best practices, and proper dependency management.`
      };

      setGeneratedFiles(files);
      addLog('success', 'All files generated and validated successfully!');

      toast({
        title: "Success!",
        description: "Containerization files have been generated successfully",
      });

    } catch (error) {
      updateStatus('error', 'Failed to process repository', 0);
      addLog('error', `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
      toast({
        title: "Error",
        description: "Failed to process the repository. Please try again.",
        variant: "destructive"
      });
    }
  };

  const downloadFiles = () => {
    if (!generatedFiles) return;

    const files = [
      { name: 'Dockerfile', content: generatedFiles.dockerfile },
      { name: 'config.yml', content: generatedFiles.config },
    ];

    if (generatedFiles.dockerCompose) {
      files.push({ name: 'docker-compose.yml', content: generatedFiles.dockerCompose });
    }

    files.forEach(file => {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });

    toast({
      title: "Files Downloaded",
      description: "All containerization files have been downloaded successfully",
    });
  };

  const deployProject = async () => {
    if (!generatedFiles || !detectedTechStack.length) {
      toast({
        title: "Cannot Deploy",
        description: "Please generate containerization files first",
        variant: "destructive"
      });
      return;
    }

    // Clear previous deployment results
    setDeploymentUrl('');
    setDeploymentStatus({ step: 'idle', message: '', progress: 0 });

    const updateDeploymentStatus = (status: DeploymentStatus) => {
      setDeploymentStatus(status);
      addLog(status.step === 'error' ? 'error' : 'info', status.message);
    };

    try {
      addLog('info', 'Starting deployment process...');
      
      const result = await DeploymentService.deploy(
        detectedTechStack,
        repoUrl,
        updateDeploymentStatus
      );

      if (result.success && result.url) {
        setDeploymentUrl(result.url);
        addLog('success', `Successfully deployed to ${result.platform}: ${result.url}`);
        toast({
          title: "Deployment Successful!",
          description: `Your app is now live on ${result.platform}`,
        });
      } else {
        addLog('error', `Deployment failed: ${result.error}`);
        toast({
          title: "Deployment Failed",
          description: result.error || "Unknown deployment error",
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown deployment error';
      addLog('error', `Deployment error: ${errorMessage}`);
      setDeploymentStatus({ step: 'error', message: errorMessage, progress: 0 });
      toast({
        title: "Deployment Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    switch (status.step) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'idle':
        return <Container className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    }
  };

  const isProcessing = status.step !== 'idle' && status.step !== 'complete' && status.step !== 'error';

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Main Input Section */}
        <Card className="glass-effect glow-effect transition-smooth">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Repository Analysis
            </CardTitle>
            <CardDescription>
              Enter a GitHub repository URL to automatically generate containerization files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/username/repository"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                className="flex-1"
                disabled={isProcessing}
              />
              <Button 
                onClick={simulateProcessing}
                disabled={isProcessing || !repoUrl}
                className="min-w-[120px]"
                variant="default"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Dockerize
                  </>
                )}
              </Button>
            </div>

            {/* Status Display */}
            {status.step !== 'idle' && (
              <Alert className="transition-smooth">
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <AlertDescription className="flex-1">
                    {status.message}
                  </AlertDescription>
                  {status.progress > 0 && (
                    <Badge variant="outline" className="ml-auto">
                      {status.progress}%
                    </Badge>
                  )}
                </div>
                {status.progress > 0 && (
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-primary transition-all duration-500 ease-out"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                )}
              </Alert>
            )}

            {/* Tech Stack Detection */}
            {detectedTechStack.length > 0 && (
              <div className="flex items-center gap-2 animate-slide-up">
                <span className="text-sm text-muted-foreground">Detected:</span>
                {detectedTechStack.map((tech) => (
                  <Badge key={tech} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        {generatedFiles && (
          <div className="mt-8 space-y-6 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold gradient-text">Generated Files</h2>
              <div className="flex gap-2">
                <Button onClick={downloadFiles} variant="default" className="glow-effect">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
                <Button 
                  onClick={deployProject} 
                  variant="default" 
                  className="glow-effect bg-gradient-to-r from-primary to-accent"
                  disabled={deploymentStatus.step !== 'idle' && deploymentStatus.step !== 'complete' && deploymentStatus.step !== 'error'}
                >
                  {deploymentStatus.step !== 'idle' && deploymentStatus.step !== 'complete' && deploymentStatus.step !== 'error' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deploying
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4 mr-2" />
                      Deploy Now
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Deployment Status */}
            {deploymentStatus.step !== 'idle' && (
              <Alert className="transition-smooth">
                <div className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-primary" />
                  <AlertDescription className="flex-1">
                    {deploymentStatus.message}
                  </AlertDescription>
                  {deploymentStatus.progress > 0 && (
                    <Badge variant="outline" className="ml-auto">
                      {deploymentStatus.progress}%
                    </Badge>
                  )}
                </div>
                {deploymentStatus.progress > 0 && (
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                      style={{ width: `${deploymentStatus.progress}%` }}
                    />
                  </div>
                )}
              </Alert>
            )}

            {/* Deployment Success */}
            {deploymentUrl && (
              <Card className="glass-effect glow-effect border-success/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-success">Deployment Successful!</h3>
                        <p className="text-sm text-muted-foreground">Your app is now live and accessible</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => window.open(deploymentUrl, '_blank')}
                      variant="outline"
                      className="border-success/20 hover:bg-success/10"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Live App
                    </Button>
                  </div>
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Live URL:</p>
                    <a 
                      href={deploymentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-primary hover:underline break-all"
                    >
                      {deploymentUrl}
                    </a>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Explanation */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {generatedFiles.explanation}
                </p>
              </CardContent>
            </Card>

            {/* File Previews */}
            <Tabs defaultValue="dockerfile" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dockerfile">Dockerfile</TabsTrigger>
                <TabsTrigger value="config">Config</TabsTrigger>
                {generatedFiles.dockerCompose && (
                  <TabsTrigger value="compose">Docker Compose</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="dockerfile" className="mt-4">
                <FilePreview 
                  filename="Dockerfile" 
                  content={generatedFiles.dockerfile}
                  language="dockerfile"
                />
              </TabsContent>
              
              <TabsContent value="config" className="mt-4">
                <FilePreview 
                  filename="config.yml" 
                  content={generatedFiles.config}
                  language="yaml"
                />
              </TabsContent>
              
              {generatedFiles.dockerCompose && (
                <TabsContent value="compose" className="mt-4">
                  <FilePreview 
                    filename="docker-compose.yml" 
                    content={generatedFiles.dockerCompose}
                    language="yaml"
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}

        {/* Logs Section */}
        {logs.length > 0 && (
          <div className="mt-8">
            <StatusLogs logs={logs} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
