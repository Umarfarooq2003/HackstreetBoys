import React from 'react';
import { Container, GitBranch, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Container className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Auto-Dock It</h1>
              <p className="text-blue-100 text-sm">Transform any GitHub repo into a containerized application</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-blue-100">
              <GitBranch className="h-4 w-4" />
              <span className="text-sm">GitHub Integration</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-100">
              <Zap className="h-4 w-4" />
              <span className="text-sm">AI-Powered</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};