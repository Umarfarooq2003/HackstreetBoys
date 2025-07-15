import React from 'react';
import { Loader2, CheckCircle, Circle } from 'lucide-react';

interface AnalysisProgressProps {
  progress: number;
  currentTask: string;
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ progress, currentTask }) => {
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

  const currentTaskIndex = tasks.indexOf(currentTask);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Repository</h2>
          <p className="text-gray-600">Our AI is analyzing your repository and generating containerization files...</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{currentTask}</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div key={index} className="flex items-center space-x-3">
              {index < currentTaskIndex ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : index === currentTaskIndex ? (
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
              <span className={`text-sm ${
                index < currentTaskIndex ? 'text-green-600' : 
                index === currentTaskIndex ? 'text-blue-600 font-medium' : 
                'text-gray-500'
              }`}>
                {task}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};