export class TechStackDetector {
  static detectFromUrl(repoUrl: string): string[] {
    // Extract repo name for basic detection
    const repoName = repoUrl.split('/').pop()?.toLowerCase() || '';
    
    // Simulate tech stack detection based on common patterns
    const techStack: string[] = [];
    
    // Language detection patterns
    if (repoName.includes('node') || repoName.includes('express') || repoName.includes('next') || repoName.includes('react')) {
      techStack.push('Node.js');
      if (repoName.includes('react') || repoName.includes('next')) {
        techStack.push('React');
      }
    } else if (repoName.includes('python') || repoName.includes('django') || repoName.includes('flask') || repoName.includes('fastapi')) {
      techStack.push('Python');
      if (repoName.includes('django')) {
        techStack.push('Django');
      } else if (repoName.includes('flask')) {
        techStack.push('Flask');
      } else if (repoName.includes('fastapi')) {
        techStack.push('FastAPI');
      }
    } else if (repoName.includes('java') || repoName.includes('spring') || repoName.includes('maven') || repoName.includes('gradle')) {
      techStack.push('Java');
      if (repoName.includes('spring')) {
        techStack.push('Spring Boot');
      }
    } else if (repoName.includes('go') || repoName.includes('golang')) {
      techStack.push('Go');
    } else if (repoName.includes('php') || repoName.includes('laravel') || repoName.includes('symfony')) {
      techStack.push('PHP');
      if (repoName.includes('laravel')) {
        techStack.push('Laravel');
      }
    } else if (repoName.includes('ruby') || repoName.includes('rails')) {
      techStack.push('Ruby');
      if (repoName.includes('rails')) {
        techStack.push('Ruby on Rails');
      }
    } else if (repoName.includes('rust')) {
      techStack.push('Rust');
    } else if (repoName.includes('dotnet') || repoName.includes('csharp') || repoName.includes('aspnet')) {
      techStack.push('.NET');
    } else {
      // Default to Node.js for demo
      techStack.push('Node.js');
    }

    // Database detection
    if (repoName.includes('mongo') || repoName.includes('mongodb')) {
      techStack.push('MongoDB');
    } else if (repoName.includes('postgres') || repoName.includes('postgresql')) {
      techStack.push('PostgreSQL');
    } else if (repoName.includes('mysql')) {
      techStack.push('MySQL');
    } else if (repoName.includes('redis')) {
      techStack.push('Redis');
    }

    // Additional services
    if (repoName.includes('nginx')) {
      techStack.push('Nginx');
    }

    return techStack.length > 0 ? techStack : ['Node.js'];
  }

  static analyzeFiles(files: { [filename: string]: string }): string[] {
    const techStack: string[] = [];
    
    // Check for specific files
    if (files['package.json']) {
      techStack.push('Node.js');
      const packageJson = JSON.parse(files['package.json']);
      if (packageJson.dependencies?.react) techStack.push('React');
      if (packageJson.dependencies?.express) techStack.push('Express');
      if (packageJson.dependencies?.next) techStack.push('Next.js');
    }

    if (files['requirements.txt'] || files['setup.py'] || files['pyproject.toml']) {
      techStack.push('Python');
      if (files['requirements.txt']?.includes('django')) techStack.push('Django');
      if (files['requirements.txt']?.includes('flask')) techStack.push('Flask');
      if (files['requirements.txt']?.includes('fastapi')) techStack.push('FastAPI');
    }

    if (files['pom.xml'] || files['build.gradle']) {
      techStack.push('Java');
      if (files['pom.xml']?.includes('spring-boot')) techStack.push('Spring Boot');
    }

    if (files['go.mod'] || files['go.sum']) {
      techStack.push('Go');
    }

    if (files['composer.json']) {
      techStack.push('PHP');
      if (files['composer.json']?.includes('laravel')) techStack.push('Laravel');
    }

    if (files['Gemfile']) {
      techStack.push('Ruby');
      if (files['Gemfile']?.includes('rails')) techStack.push('Ruby on Rails');
    }

    if (files['Cargo.toml']) {
      techStack.push('Rust');
    }

    if (files['*.csproj'] || files['*.sln']) {
      techStack.push('.NET');
    }

    return techStack.length > 0 ? techStack : ['Node.js'];
  }
}