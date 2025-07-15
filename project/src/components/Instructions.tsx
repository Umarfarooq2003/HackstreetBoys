import React from 'react';
import { Terminal, PlayCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '../App';

interface InstructionsProps {
  result: AnalysisResult;
}

export const Instructions: React.FC<InstructionsProps> = ({ result }) => {
  const steps = [
    {
      title: 'Clone the Repository',
      command: `git clone ${result.repository}`,
      description: 'Download the repository to your local machine'
    },
    {
      title: 'Navigate to Directory',
      command: `cd ${result.repository.split('/').pop()}`,
      description: 'Change to the project directory'
    },
    {
      title: 'Create Dockerfile',
      command: 'Create a new file named "Dockerfile" and paste the generated content',
      description: 'Add the Dockerfile to the project root'
    },
    {
      title: 'Build Docker Image',
      command: `docker build -t ${result.repository.split('/').pop()} .`,
      description: 'Build the Docker image from the Dockerfile'
    },
    {
      title: 'Run Container',
      command: `docker run -p ${result.ports[0]}:${result.ports[0]} ${result.repository.split('/').pop()}`,
      description: 'Start the container and expose the application port'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto mb-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <PlayCircle className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Deployment Instructions</h2>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">AI Analysis Summary</h3>
          </div>
          <p className="text-blue-800 text-sm">{result.explanation}</p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{step.description}</p>
                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                  <div className="flex items-center space-x-2">
                    <Terminal className="h-4 w-4" />
                    <span>{step.command}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Success!</h3>
          </div>
          <p className="text-green-800 text-sm">
            Your application should now be running at <strong>http://localhost:{result.ports[0]}</strong>
          </p>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-900">Prerequisites</h3>
          </div>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• Docker must be installed on your system</li>
            <li>• Git must be installed to clone the repository</li>
            <li>• Ensure the required ports are available</li>
          </ul>
        </div>
      </div>
    </div>
  );
};