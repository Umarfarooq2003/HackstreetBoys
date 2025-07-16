import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Code, 
  TestTube, 
  Rocket, 
  Download,
  Share,
  TrendingUp,
  Clock,
  Target,
  Star,
  ExternalLink
} from 'lucide-react';
import { ProjectData } from './DevOpsAssistant';

interface DevOpsReportProps {
  projectData: ProjectData;
}

const DevOpsReport: React.FC<DevOpsReportProps> = ({ projectData }) => {
  const passedTests = projectData.testResults.filter(t => t.status === 'pass').length;
  const failedTests = projectData.testResults.filter(t => t.status === 'fail').length;
  const totalTests = projectData.testResults.length;
  const testSuccessRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  const codeQualityScore = () => {
    const codeLength = projectData.code.length;
    const hasComments = projectData.code.includes('//') || projectData.code.includes('#');
    const hasStructure = projectData.code.includes('function') || projectData.code.includes('def') || projectData.code.includes('class');
    
    let score = 70; // Base score
    if (hasComments) score += 10;
    if (hasStructure) score += 15;
    if (codeLength > 500) score += 5;
    
    return Math.min(score, 100);
  };

  const deploymentStatus = projectData.deploymentStatus;
  const qualityScore = codeQualityScore();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-warning" />;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-destructive';
  };

  const recommendations = [
    {
      title: "Add Error Handling",
      description: "Implement comprehensive error handling for better user experience",
      priority: "high",
      implemented: projectData.code.includes('try') || projectData.code.includes('catch')
    },
    {
      title: "Add Input Validation",
      description: "Validate user inputs to prevent security vulnerabilities",
      priority: "high",
      implemented: projectData.code.includes('validate') || projectData.code.includes('check')
    },
    {
      title: "Improve Documentation",
      description: "Add more comments and documentation for better maintainability",
      priority: "medium",
      implemented: (projectData.code.match(/\/\*|\*\/|#|\/\//g) || []).length > 5
    },
    {
      title: "Add Loading States",
      description: "Implement loading indicators for better user feedback",
      priority: "medium",
      implemented: projectData.code.includes('loading') || projectData.code.includes('spinner')
    },
    {
      title: "Responsive Design",
      description: "Ensure the application works well on all device sizes",
      priority: "low",
      implemented: projectData.code.includes('responsive') || projectData.code.includes('@media')
    }
  ];

  const downloadReport = () => {
    const reportContent = `
# DevOps Project Report

## Project Overview
- **Prompt**: ${projectData.prompt}
- **Language**: ${projectData.language}
- **Generated**: ${new Date().toLocaleDateString()}

## Code Quality Assessment
- **Quality Score**: ${qualityScore}%
- **Lines of Code**: ${projectData.code.split('\n').length}
- **Has Comments**: ${projectData.code.includes('//') || projectData.code.includes('#') ? 'Yes' : 'No'}

## Test Results
- **Total Tests**: ${totalTests}
- **Passed**: ${passedTests}
- **Failed**: ${failedTests}
- **Success Rate**: ${testSuccessRate.toFixed(1)}%

## Deployment Status
- **Status**: ${deploymentStatus}
- **URL**: ${projectData.deploymentUrl || 'Not deployed'}

## Recommendations
${recommendations.map(rec => `- ${rec.title}: ${rec.description} (${rec.implemented ? 'Implemented' : 'Not implemented'})`).join('\n')}

## Generated Code
\`\`\`${projectData.language.toLowerCase()}
${projectData.code}
\`\`\`

## Test Code
\`\`\`
${projectData.tests}
\`\`\`
    `;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'devops-report.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>DevOps Project Report</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-primary" />
                <span className="font-medium">Code Quality</span>
              </div>
              <div className="text-2xl font-bold flex items-center space-x-2">
                <span className={getQualityColor(qualityScore)}>{qualityScore}%</span>
                <Star className={`w-5 h-5 ${qualityScore >= 90 ? 'text-success fill-current' : 'text-muted-foreground'}`} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TestTube className="w-4 h-4 text-accent" />
                <span className="font-medium">Test Coverage</span>
              </div>
              <div className="text-2xl font-bold text-accent">
                {testSuccessRate.toFixed(0)}%
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Rocket className="w-4 h-4 text-success" />
                <span className="font-medium">Deployment</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(deploymentStatus)}
                <span className="font-medium capitalize">{deploymentStatus}</span>
              </div>
              {projectData.deploymentUrl && deploymentStatus === 'success' && (
                <div className="mt-2">
                  <a 
                    href={projectData.deploymentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-accent hover:underline"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    View Live App
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Project Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Original Prompt</h4>
              <p className="text-muted-foreground text-sm bg-muted/30 p-3 rounded-lg">
                {projectData.prompt || 'No prompt provided'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Language</span>
                <p className="font-medium">{projectData.language || 'Not detected'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Lines of Code</span>
                <p className="font-medium">{projectData.code.split('\n').length}</p>
              </div>
            </div>

            <div>
              <span className="text-sm text-muted-foreground">Generated</span>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>

            {projectData.deploymentUrl && (
              <div>
                <span className="text-sm text-muted-foreground">Deployment URL</span>
                <div className="flex items-center space-x-2 mt-1">
                  <a 
                    href={projectData.deploymentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-accent hover:underline text-sm font-medium break-all"
                  >
                    {projectData.deploymentUrl}
                  </a>
                  <ExternalLink className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Performance Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Code Quality</span>
                  <span className="text-sm text-muted-foreground">{qualityScore}%</span>
                </div>
                <Progress value={qualityScore} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Test Success Rate</span>
                  <span className="text-sm text-muted-foreground">{testSuccessRate.toFixed(1)}%</span>
                </div>
                <Progress value={testSuccessRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Deployment Readiness</span>
                  <span className="text-sm text-muted-foreground">
                    {deploymentStatus === 'success' ? '100' : '0'}%
                  </span>
                </div>
                <Progress value={deploymentStatus === 'success' ? 100 : 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results Detail */}
      {totalTests > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="w-5 h-5" />
              <span>Test Results Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{passedTests}</div>
                <div className="text-sm text-muted-foreground">Tests Passed</div>
              </div>
              <div className="text-center p-4 bg-destructive/10 rounded-lg">
                <div className="text-2xl font-bold text-destructive">{failedTests}</div>
                <div className="text-sm text-muted-foreground">Tests Failed</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold">{totalTests}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
            </div>

            <div className="space-y-2">
              {projectData.testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {test.status === 'pass' ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span className="font-medium">{test.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {test.duration && (
                      <span className="text-xs text-muted-foreground flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{test.duration}ms</span>
                      </span>
                    )}
                    <Badge 
                      variant={test.status === 'pass' ? 'default' : 'destructive'}
                      className={test.status === 'pass' ? 'bg-success hover:bg-success/80' : ''}
                    >
                      {test.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Recommendations for Improvement</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/20 rounded-lg">
                <div className="p-1">
                  {rec.implemented ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <AlertTriangle className={`w-4 h-4 ${
                      rec.priority === 'high' ? 'text-destructive' :
                      rec.priority === 'medium' ? 'text-warning' : 'text-muted-foreground'
                    }`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{rec.title}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        rec.priority === 'high' ? 'border-destructive/50 text-destructive' :
                        rec.priority === 'medium' ? 'border-warning/50 text-warning' :
                        'border-muted-foreground/50 text-muted-foreground'
                      }`}
                    >
                      {rec.priority} priority
                    </Badge>
                    {rec.implemented && (
                      <Badge variant="outline" className="border-success/50 text-success text-xs">
                        implemented
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevOpsReport;