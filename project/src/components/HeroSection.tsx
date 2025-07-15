import { Container, Zap, Code2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroSection = () => {
  const scrollToMain = () => {
    document.querySelector('.container')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        {/* Logo/Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <Container className="h-16 w-16 text-primary animate-pulse-glow" />
            <Zap className="absolute -top-1 -right-1 h-6 w-6 text-accent animate-bounce" />
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          <span className="gradient-text">Auto-Dock It</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
          Transform any GitHub repository into production-ready containers
          <br />
          <span className="text-primary font-semibold">Instantly. Intelligently. Automatically.</span>
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <Code2 className="h-5 w-5 text-primary" />
            <span className="font-medium">AI-Powered Analysis</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <Container className="h-5 w-5 text-primary" />
            <span className="font-medium">Smart Containerization</span>
          </div>
          <div className="flex items-center justify-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
            <Download className="h-5 w-5 text-primary" />
            <span className="font-medium">Instant Downloads</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          size="lg" 
          onClick={scrollToMain}
          className="bg-gradient-primary hover:scale-105 transition-bounce text-lg px-8 py-3 glow-effect"
        >
          <Zap className="h-5 w-5 mr-2" />
          Start Dockerizing
        </Button>

        {/* Stats or additional info */}
        <div className="mt-12 text-sm text-muted-foreground">
          <p>Supports Python • Node.js • Java • Go • PHP • Ruby • and more...</p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};