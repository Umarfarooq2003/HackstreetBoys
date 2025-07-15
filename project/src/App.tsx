import React, { useState } from 'react';
import { Header } from './components/Header';
import { RepositoryInput } from './components/RepositoryInput';
import { AnalysisProgress } from './components/AnalysisProgress';
import { GeneratedFiles } from './components/GeneratedFiles';
import { Instructions } from './components/Instructions';
import { LiveDeployment } from './components/LiveDeployment';
import { Footer } from './components/Footer';

export interface AnalysisResult {
  repository: string;
  techStack: string[];
  dependencies: string[];
  dockerfile: string;
  dockerCompose?: string;
  environmentVariables: Record<string, string>;
  ports: number[];
  commands: {
    install: string;
    build: string;
    start: string;
    test?: string;
  };
  healthCheck?: string;
  explanation: string;
}

function App() {
  const [currentStep, setCurrentStep] = useState<'input' | 'analyzing' | 'completed' | 'deploying'>('input');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');

  const handleAnalyze = async (repoUrl: string) => {
    setCurrentStep('analyzing');
    setProgress(0);
    setCurrentTask('Cloning repository...');

    // Simulate analysis process
    const tasks = [
      'Cloning repository...',
      'Analyzing code structure...',
      'Detecting tech stack...',
      'Identifying dependencies...',
      'Generating Dockerfile...',
      'Creating configuration files...',
      'Validating setup...',
      'Finalizing analysis...'
    ];

    for (let i = 0; i < tasks.length; i++) {
      setCurrentTask(tasks[i]);
      setProgress(((i + 1) / tasks.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Mock analysis result
    const mockResult: AnalysisResult = {
      repository: repoUrl,
      techStack: ['React', 'TypeScript', 'Node.js', 'Vite'],
      dependencies: ['react', 'typescript', 'vite', 'tailwindcss'],
      dockerfile: `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]`,
      dockerCompose: `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped`,
      environmentVariables: {
        NODE_ENV: 'production',
        PORT: '3000'
      },
      ports: [3000],
      commands: {
        install: 'npm install',
        build: 'npm run build',
        start: 'npm start',
        test: 'npm test'
      },
      healthCheck: 'curl -f http://localhost:3000/health || exit 1',
      explanation: 'This is a modern React application built with TypeScript and Vite. The application uses Tailwind CSS for styling and includes a development server. The Dockerfile is optimized for production deployment with multi-stage builds and minimal image size.'
    };

    setAnalysisResult(mockResult);
    setCurrentStep('completed');
  };

  const handleReset = () => {
    setCurrentStep('input');
    setAnalysisResult(null);
    setProgress(0);
    setCurrentTask('');
  };

  const handleLiveDeploy = () => {
    setCurrentStep('deploying');
  };

  const handleBackToResults = () => {
    setCurrentStep('completed');
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {currentStep === 'input' && (
          <RepositoryInput onAnalyze={handleAnalyze} />
        )}
        
        {currentStep === 'analyzing' && (
          <AnalysisProgress progress={progress} currentTask={currentTask} />
        )}
        
        {currentStep === 'completed' && analysisResult && (
          <>
            <GeneratedFiles result={analysisResult} />
            <Instructions result={analysisResult} />
            
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Ready for Live Deployment?</h3>
                <p className="text-green-100 mb-4">
                  Skip the manual steps and let our automation handle the entire Docker setup process.
                  Your application will be running at http://localhost:3000 in minutes.
                </p>
                <button
                  onClick={handleLiveDeploy}
                  className="bg-white text-green-700 hover:bg-green-50 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  🚀 Deploy Now with Auto-Dock
                </button>
              </div>
            </div>
          </>
        )}
        
        {currentStep === 'deploying' && analysisResult && (
          <LiveDeployment 
            repoUrl={analysisResult.repository} 
            onBack={handleBackToResults}
          />
        )}
        
        {currentStep === 'completed' && (
          <div className="mt-8 text-center">
            <button
              onClick={handleReset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Analyze Another Repository
            </button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;