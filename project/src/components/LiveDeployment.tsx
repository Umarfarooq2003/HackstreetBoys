import React, { useState, useEffect } from 'react';
import { ExternalLink, Play, Square, Trash2, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { DockerService, DockerExecutionResult, DockerExecutionProgress } from '../services/dockerService';

interface LiveDeploymentProps {
  repoUrl: string;
  onBack: () => void;
}

export const LiveDeployment: React.FC<LiveDeploymentProps> = ({ repoUrl, onBack }) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DockerExecutionResult | null>(null);
  const [progress, setProgress] = useState<DockerExecutionProgress | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [port, setPort] = useState(3000);

  const dockerService = DockerService.getInstance();

  const handleDeploy = async () => {
    setIsDeploying(true);
    setDeploymentResult(null);
    setLogs([]);
    setProgress(null);

    const result = await dockerService.executeDockerSetup(
      repoUrl,
      port,
      (progressUpdate) => {
        setProgress(progressUpdate);
        if (progressUpdate.message) {
          setLogs(prev => [...prev, progressUpdate.message]);
        }
      }
    );

    setDeploymentResult(result);
    setIsDeploying(false);

    if (result.success && result.logs) {
      setLogs(prev => [...prev, ...result.logs]);
    }
  };

  const handleStop = async () => {
    if (deploymentResult?.containerName) {
      await dockerService.stopContainer(deploymentResult.containerName);
      setDeploymentResult(null);
      setLogs(prev => [...prev, 'Container stopped']);
    }
  };

  const handleRemove = async () => {
    if (deploymentResult?.containerName) {
      await dockerService.removeContainer(deploymentResult.containerName);
      setDeploymentResult(null);
      setLogs(prev => [...prev, 'Container removed']);
    }
  };

  const handleCancel = () => {
    dockerService.cancelExecution();
    setIsDeploying(false);
    setProgress(null);
    setLogs(prev => [...prev, 'Deployment cancelled']);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Live Docker Deployment</h2>
              <p className="text-blue-100 mt-1">Automated containerization in progress</p>
            </div>
            <button
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              Back to Analysis
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Repository Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Repository</h3>
            <p className="text-gray-700 font-mono text-sm">{repoUrl}</p>
          </div>

          {/* Port Configuration */}
          <div className="mb-6">
            <label htmlFor="port" className="block text-sm font-medium text-gray-700 mb-2">
              Target Port
            </label>
            <input
              id="port"
              type="number"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value) || 3000)}
              disabled={isDeploying || deploymentResult?.success}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              min="1000"
              max="65535"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex space-x-4 mb-6">
            {!deploymentResult?.success && !isDeploying && (
              <button
                onClick={handleDeploy}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Play className="h-5 w-5" />
                <span>Deploy Now</span>
              </button>
            )}

            {isDeploying && (
              <button
                onClick={handleCancel}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Square className="h-5 w-5" />
                <span>Cancel</span>
              </button>
            )}

            {deploymentResult?.success && (
              <>
                <button
                  onClick={handleStop}
                  className="flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Square className="h-4 w-4" />
                  <span>Stop</span>
                </button>
                <button
                  onClick={handleRemove}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Remove</span>
                </button>
              </>
            )}
          </div>

          {/* Progress Indicator */}
          {progress && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{progress.message}</span>
                <span className="text-sm text-gray-500">{Math.round(progress.progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Deployment Result */}
          {deploymentResult && (
            <div className={`rounded-lg p-4 mb-6 ${
              deploymentResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {deploymentResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <h3 className={`font-semibold ${
                  deploymentResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {deploymentResult.success ? 'Deployment Successful!' : 'Deployment Failed'}
                </h3>
              </div>
              <p className={`text-sm ${
                deploymentResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {deploymentResult.message}
              </p>

              {deploymentResult.success && deploymentResult.url && (
                <div className="mt-4">
                  <a
                    href={deploymentResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Open Application</span>
                  </a>
                </div>
              )}

              {deploymentResult.success && (
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-900">Container:</span>
                    <p className="text-green-800 font-mono">{deploymentResult.containerName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-900">Image:</span>
                    <p className="text-green-800 font-mono">{deploymentResult.imageName}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Logs */}
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="h-5 w-5 text-gray-400" />
              <h3 className="text-white font-medium">Deployment Logs</h3>
              {isDeploying && <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />}
            </div>
            <div className="bg-black rounded p-3 h-64 overflow-y-auto font-mono text-sm">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Click "Deploy Now" to start...</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-green-400 mb-1">
                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">What happens during deployment:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>1. Repository is cloned to your local machine</li>
              <li>2. Project structure is analyzed automatically</li>
              <li>3. Dockerfile is generated based on detected tech stack</li>
              <li>4. Docker image is built with optimized configuration</li>
              <li>5. Container is started and exposed on the specified port</li>
              <li>6. Health checks verify the application is running</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};