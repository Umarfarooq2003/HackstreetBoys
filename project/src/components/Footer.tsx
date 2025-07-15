import React from 'react';
import { Github, Heart, Coffee } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Auto-Dock It</h3>
            <p className="text-gray-400 text-sm">
              Simplifying containerization for developers worldwide. 
              Transform any GitHub repository into a production-ready Docker setup.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• AI-powered code analysis</li>
              <li>• Automatic Dockerfile generation</li>
              <li>• Docker Compose support</li>
              <li>• Health checks and validation</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• Step-by-step deployment guide</li>
              <li>• Docker best practices</li>
              <li>• Community support</li>
              <li>• API documentation</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>and</span>
              <Coffee className="h-4 w-4 text-yellow-500" />
              <span>for the developer community</span>
            </div>
            
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <span className="text-gray-400 text-sm">
                © 2025 Auto-Dock It. All rights reserved.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};