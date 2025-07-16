import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Code, 
  TestTube, 
  Rocket, 
  FileText, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Terminal,
  Sparkles
} from 'lucide-react';
import ProjectGenerator from './ProjectGenerator';
import TestRunner from './TestRunner';
import LivePreview from './LivePreview';
import DevOpsReport from './DevOpsReport';

export interface ProjectData {
  prompt: string;
  language: string;
  code: string;
  tests: string;
  testResults: TestResult[];
  deploymentStatus: 'pending' | 'running' | 'success' | 'error';
  deploymentUrl?: string;
}

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'pending';
  message?: string;
  duration?: number;
}

const DevOpsAssistant: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData>({
    prompt: '',
    language: '',
    code: '',
    tests: '',
    testResults: [],
    deploymentStatus: 'pending',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleProjectGenerated = (data: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...data }));
    setCurrentStep(2);
    setProgress(25);
  };

  const handleTestsGenerated = (tests: string, results: TestResult[]) => {
    setProjectData(prev => ({ 
      ...prev, 
      tests, 
      testResults: results 
    }));
    setCurrentStep(3);
    setProgress(50);
  };

  const handleDeploymentComplete = (status: 'success' | 'error', url?: string) => {
    setProjectData(prev => ({ 
      ...prev, 
      deploymentStatus: status,
      deploymentUrl: url 
    }));
    setCurrentStep(4);
    setProgress(100);
  };

  const resetProject = () => {
    setCurrentStep(1);
    setProgress(0);
    setProjectData({
      prompt: '',
      language: '',
      code: '',
      tests: '',
      testResults: [],
      deploymentStatus: 'pending',
    });
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'complete';
    if (step === currentStep) return 'active';
    return 'pending';
  };

  const getStepIcon = (step: number, icon: React.ReactNode) => {
    const status = getStepStatus(step);
    if (status === 'complete') return <CheckCircle className="w-5 h-5 text-success" />;
    if (status === 'active') return <div className="w-5 h-5 text-primary">{icon}</div>;
    return <div className="w-5 h-5 text-muted-foreground">{icon}</div>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-primary">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-background/10 rounded-lg">
                <Zap className="w-8 h-8 text-background" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-background">AI DevOps Assistant</h1>
                <p className="text-background/80">From idea to deployment in minutes</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={resetProject}
              className="bg-background/10 hover:bg-background/20 text-background border-background/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{progress}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Steps Navigation */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                {getStepIcon(1, <Code className="w-5 h-5" />)}
                <span className={`text-sm font-medium ${getStepStatus(1) === 'active' ? 'text-primary' : getStepStatus(1) === 'complete' ? 'text-success' : 'text-muted-foreground'}`}>
                  Generate Code
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getStepIcon(2, <TestTube className="w-5 h-5" />)}
                <span className={`text-sm font-medium ${getStepStatus(2) === 'active' ? 'text-primary' : getStepStatus(2) === 'complete' ? 'text-success' : 'text-muted-foreground'}`}>
                  Run Tests
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getStepIcon(3, <Rocket className="w-5 h-5" />)}
                <span className={`text-sm font-medium ${getStepStatus(3) === 'active' ? 'text-primary' : getStepStatus(3) === 'complete' ? 'text-success' : 'text-muted-foreground'}`}>
                  Deploy
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getStepIcon(4, <FileText className="w-5 h-5" />)}
                <span className={`text-sm font-medium ${getStepStatus(4) === 'active' ? 'text-primary' : getStepStatus(4) === 'complete' ? 'text-success' : 'text-muted-foreground'}`}>
                  Report
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs value={currentStep.toString()} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="1" disabled={currentStep < 1}>
              <Code className="w-4 h-4 mr-2" />
              Code Generation
            </TabsTrigger>
            <TabsTrigger value="2" disabled={currentStep < 2}>
              <TestTube className="w-4 h-4 mr-2" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="3" disabled={currentStep < 3}>
              <Rocket className="w-4 h-4 mr-2" />
              Deployment
            </TabsTrigger>
            <TabsTrigger value="4" disabled={currentStep < 4}>
              <FileText className="w-4 h-4 mr-2" />
              Report
            </TabsTrigger>
          </TabsList>

          <TabsContent value="1" className="space-y-6">
            <ProjectGenerator 
              onProjectGenerated={handleProjectGenerated}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </TabsContent>

          <TabsContent value="2" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TestRunner 
                projectData={projectData}
                onTestsComplete={handleTestsGenerated}
              />
              <LivePreview projectData={projectData} />
            </div>
          </TabsContent>

          <TabsContent value="3" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Rocket className="w-5 h-5" />
                    <span>Deployment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge 
                      variant={projectData.deploymentStatus === 'success' ? 'default' : 'secondary'}
                      className={`${projectData.deploymentStatus === 'success' ? 'bg-success hover:bg-success/80' : 'bg-status-pending'}`}
                    >
                      {projectData.deploymentStatus === 'success' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : projectData.deploymentStatus === 'error' ? (
                        <XCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {projectData.deploymentStatus}
                    </Badge>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      const timestamp = Date.now();
                      const projectName = projectData.language.toLowerCase().replace(/[^a-z0-9]/g, '-');
                      const deploymentUrl = `https://${projectName}-${timestamp}.netlify.app`;
                      handleDeploymentComplete('success', deploymentUrl);
                    }}
                    className="w-full"
                    disabled={!projectData.code}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Deploy Application
                  </Button>
                  
                  {projectData.deploymentUrl && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Deployment URL:</p>
                      <a 
                        href={projectData.deploymentUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-accent hover:underline text-sm"
                      >
                        {projectData.deploymentUrl}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <LivePreview projectData={projectData} />
            </div>
          </TabsContent>

          <TabsContent value="4" className="space-y-6">
            <DevOpsReport projectData={projectData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DevOpsAssistant;