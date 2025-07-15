import React, { useState } from 'react';
import { Github, Search, Star, GitFork } from 'lucide-react';

interface RepositoryInputProps {
  onAnalyze: (repoUrl: string) => void;
}

export const RepositoryInput: React.FC<RepositoryInputProps> = ({ onAnalyze }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const validateGitHubPublicRepo = async (url: string) => {
    const regex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)(\.git)?\/?$/;
    const match = url.match(regex);
    if (!match) return false;

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, ''); // Remove .git if it exists

    const token = import.meta.env.VITE_HF_TOKEN;

    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const res = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return false;

      const data = await res.json();
      return data && data.visibility === 'public' || data.private === false;
    } catch (err) {
      console.error('GitHub repo check failed:', err);
      return false;
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setRepoUrl(value);
    setIsValid(false);
    setError('');
    setChecking(true);

    if (value === '') {
      setChecking(false);
      return;
    }

    const isValidRepo = await validateGitHubPublicRepo(value);
    setIsValid(isValidRepo);
    setError(isValidRepo ? '' : 'Please enter a valid *public* GitHub repository URL');
    setChecking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onAnalyze(repoUrl);
    }
  };

  const exampleRepos = [
    'https://github.com/vercel/next.js',
    'https://github.com/facebook/react',
    'https://github.com/vuejs/vue',
    'https://github.com/angular/angular'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Containerize Any GitHub Repository
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Paste a GitHub repository URL and let our AI analyze the code structure,
          detect dependencies, and generate production-ready Docker configurations.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="repository-url" className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Repository URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Github className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="repository-url"
                type="url"
                value={repoUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repository"
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                required
              />
            </div>
            {checking && (
              <p className="mt-2 text-sm text-gray-500">Checking repository...</p>
            )}
            {!checking && error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-lg"
          >
            <Search className="h-5 w-5" />
            <span>Analyze Repository</span>
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Try These Popular Repositories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exampleRepos.map((repo, index) => (
            <button
              key={index}
              onClick={() => {
                setRepoUrl(repo);
                setIsValid(true);
                setError('');
              }}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <Github className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-600">
                    {repo.replace('https://github.com/', '')}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Star className="h-3 w-3" />
                      <span>Popular</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <GitFork className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
