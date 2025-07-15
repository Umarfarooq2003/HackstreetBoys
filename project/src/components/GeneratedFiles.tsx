import React, { useState } from 'react';
import { Download, Copy, FileText, Settings, Database, CheckCircle } from 'lucide-react';
import { AnalysisResult } from '../App';

interface GeneratedFilesProps {
  result: AnalysisResult;
}

export const GeneratedFiles: React.FC<GeneratedFilesProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'dockerfile' | 'compose' | 'config'>('dockerfile');
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (content: string, key: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const configContent = `# Environment Variables
${Object.entries(result.environmentVariables)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n')}

# Ports
EXPOSE ${result.ports.join(', ')}

# Commands
INSTALL: ${result.commands.install}
BUILD: ${result.commands.build}
START: ${result.commands.start}
${result.commands.test ? `TEST: ${result.commands.test}` : ''}

# Health Check
${result.healthCheck || 'No health check configured'}`;

  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Analysis Complete!</h2>
              <p className="text-green-100">Your containerization files are ready</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Tech Stack Detected</h3>
              <div className="flex flex-wrap gap-2">
                {result.techStack.map((tech, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Dependencies Found</h3>
              <p className="text-purple-700 text-sm">{result.dependencies.length} dependencies identified</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Ports Configured</h3>
              <div className="flex flex-wrap gap-2">
                {result.ports.map((port, index) => (
                  <span key={index} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                    {port}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dockerfile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dockerfile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Dockerfile</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('compose')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'compose'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Docker Compose</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'config'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Configuration</span>
                </div>
              </button>
            </nav>
          </div>

          <div className="relative">
            {activeTab === 'dockerfile' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Dockerfile</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(result.dockerfile, 'dockerfile')}
                      className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span>{copiedStates.dockerfile ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => downloadFile(result.dockerfile, 'Dockerfile')}
                      className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {result.dockerfile}
                </pre>
              </div>
            )}

            {activeTab === 'compose' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">docker-compose.yml</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(result.dockerCompose || '', 'compose')}
                      className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span>{copiedStates.compose ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => downloadFile(result.dockerCompose || '', 'docker-compose.yml')}
                      className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {result.dockerCompose}
                </pre>
              </div>
            )}

            {activeTab === 'config' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Configuration Details</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(configContent, 'config')}
                      className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Copy className="h-4 w-4" />
                      <span>{copiedStates.config ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => downloadFile(configContent, 'config.txt')}
                      className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  {configContent}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};