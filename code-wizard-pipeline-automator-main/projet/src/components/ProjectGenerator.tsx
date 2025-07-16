import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Lightbulb, 
  Wand2, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Globe,
  Database,
  Smartphone,
  Bot,
  UserCheck
} from 'lucide-react';
import { ProjectData } from './DevOpsAssistant';

interface ProjectGeneratorProps {
  onProjectGenerated: (data: Partial<ProjectData>) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const ProjectGenerator: React.FC<ProjectGeneratorProps> = ({
  onProjectGenerated,
  isGenerating,
  setIsGenerating
}) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [showRevision, setShowRevision] = useState(false);

  const sampleIdeas = [
    {
      icon: <Globe className="w-4 h-4" />,
      title: "Interactive Calculator",
      description: "Create a scientific calculator with HTML, CSS, and JavaScript",
      prompt: "Create a beautiful, responsive scientific calculator with HTML, CSS, and JavaScript. Include basic arithmetic operations, trigonometric functions, and memory storage features."
    },
    {
      icon: <Database className="w-4 h-4" />,
      title: "Task Manager API",
      description: "Build a REST API for task management using Python Flask",
      prompt: "Create a RESTful API using Python Flask for a task management system. Include endpoints for creating, reading, updating, and deleting tasks with user authentication."
    },
    {
      icon: <Smartphone className="w-4 h-4" />,
      title: "Weather Dashboard",
      description: "Build a responsive weather dashboard with real-time data",
      prompt: "Create a responsive weather dashboard using HTML, CSS, and JavaScript that displays current weather, 7-day forecast, and interactive charts."
    },
    {
      icon: <Bot className="w-4 h-4" />,
      title: "Chat Bot Interface",
      description: "Create an interactive chatbot interface with AI responses",
      prompt: "Build an interactive chatbot interface using HTML, CSS, and JavaScript with message history, typing indicators, and simulated AI responses."
    },
    {
      icon: <UserCheck className="w-4 h-4" />,
      title: "React Login System",
      description: "Create a login and registration system using React",
      prompt: "Create a login and registration system using React with form validation, state management, and responsive design. Include features like password strength indicator and remember me functionality."
    }
  ];

  const detectLanguage = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('python') || lowerPrompt.includes('flask') || lowerPrompt.includes('django') || lowerPrompt.includes('api')) {
      return 'Python';
    } else if (lowerPrompt.includes('react') || lowerPrompt.includes('jsx') || lowerPrompt.includes('component')) {
      return 'JavaScript (React)';
    } else if (lowerPrompt.includes('html') || lowerPrompt.includes('css') || lowerPrompt.includes('javascript') || lowerPrompt.includes('web')) {
      return 'HTML/CSS/JavaScript';
    } else if (lowerPrompt.includes('node') || lowerPrompt.includes('express')) {
      return 'JavaScript (Node.js)';
    } else {
      return 'HTML/CSS/JavaScript'; // Default
    }
  };

  const generateCode = async (userPrompt: string) => {
    setIsGenerating(true);
    const language = detectLanguage(userPrompt);
    setDetectedLanguage(language);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    let code = '';
    
    if (language.includes('Python')) {
      code = `# ${userPrompt}
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Sample data
tasks = [
    {"id": 1, "title": "Learn Python", "completed": False},
    {"id": 2, "title": "Build API", "completed": True}
]

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    data = request.get_json()
    new_task = {
        "id": len(tasks) + 1,
        "title": data.get('title', ''),
        "completed": False
    }
    tasks.append(new_task)
    return jsonify(new_task), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update an existing task"""
    task = next((t for t in tasks if t["id"] == task_id), None)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    data = request.get_json()
    task.update(data)
    return jsonify(task)

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    global tasks
    tasks = [t for t in tasks if t["id"] != task_id]
    return jsonify({"message": "Task deleted"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)`;
    } else {
      code = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interactive Calculator</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .calculator {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 30px;
            max-width: 400px;
            width: 100%;
        }

        .display {
            background: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: right;
            font-size: 2em;
            min-height: 80px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }

        .buttons {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
        }

        button {
            padding: 20px;
            border: none;
            border-radius: 10px;
            font-size: 1.2em;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
        }

        .number {
            background: #ecf0f1;
            color: #2c3e50;
        }

        .operator {
            background: #3498db;
            color: white;
        }

        .equals {
            background: #e74c3c;
            color: white;
            grid-column: span 2;
        }

        .clear {
            background: #95a5a6;
            color: white;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        button:active {
            transform: translateY(0);
        }

        @media (max-width: 480px) {
            .calculator {
                padding: 20px;
            }
            
            button {
                padding: 15px;
                font-size: 1em;
            }
            
            .display {
                font-size: 1.5em;
                padding: 15px;
                min-height: 60px;
            }
        }
    </style>
</head>
<body>
    <div class="calculator">
        <div class="display" id="display">0</div>
        <div class="buttons">
            <button class="clear" onclick="clearDisplay()">C</button>
            <button class="clear" onclick="deleteLast()">⌫</button>
            <button class="operator" onclick="appendToDisplay('/')">/</button>
            <button class="operator" onclick="appendToDisplay('*')">×</button>
            
            <button class="number" onclick="appendToDisplay('7')">7</button>
            <button class="number" onclick="appendToDisplay('8')">8</button>
            <button class="number" onclick="appendToDisplay('9')">9</button>
            <button class="operator" onclick="appendToDisplay('-')">-</button>
            
            <button class="number" onclick="appendToDisplay('4')">4</button>
            <button class="number" onclick="appendToDisplay('5')">5</button>
            <button class="number" onclick="appendToDisplay('6')">6</button>
            <button class="operator" onclick="appendToDisplay('+')">+</button>
            
            <button class="number" onclick="appendToDisplay('1')">1</button>
            <button class="number" onclick="appendToDisplay('2')">2</button>
            <button class="number" onclick="appendToDisplay('3')">3</button>
            <button class="equals" onclick="calculate()" rowspan="2">=</button>
            
            <button class="number" onclick="appendToDisplay('0')" colspan="2">0</button>
            <button class="number" onclick="appendToDisplay('.')">.</button>
        </div>
    </div>

    <script>
        let display = document.getElementById('display');
        let currentInput = '0';
        let operator = null;
        let waitingForOperand = false;

        function updateDisplay() {
            display.textContent = currentInput;
        }

        function appendToDisplay(value) {
            if (waitingForOperand) {
                currentInput = value;
                waitingForOperand = false;
            } else {
                currentInput = currentInput === '0' ? value : currentInput + value;
            }
            updateDisplay();
        }

        function clearDisplay() {
            currentInput = '0';
            operator = null;
            waitingForOperand = false;
            updateDisplay();
        }

        function deleteLast() {
            currentInput = currentInput.slice(0, -1) || '0';
            updateDisplay();
        }

        function calculate() {
            try {
                // Replace × with * for evaluation
                let expression = currentInput.replace(/×/g, '*');
                let result = eval(expression);
                currentInput = result.toString();
                updateDisplay();
                waitingForOperand = true;
            } catch (error) {
                currentInput = 'Error';
                updateDisplay();
                waitingForOperand = true;
            }
        }

        // Keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            
            if ('0123456789.'.includes(key)) {
                appendToDisplay(key);
            } else if ('+-*/'.includes(key)) {
                appendToDisplay(key === '*' ? '×' : key);
            } else if (key === 'Enter' || key === '=') {
                calculate();
            } else if (key === 'Escape' || key === 'c' || key === 'C') {
                clearDisplay();
            } else if (key === 'Backspace') {
                deleteLast();
            }
        });
    </script>
</body>
</html>`;
    }

    setGeneratedCode(code);
    setIsGenerating(false);
  };

  const handleApprove = () => {
    onProjectGenerated({
      prompt,
      language: detectedLanguage,
      code: generatedCode
    });
  };

  const handleRevise = () => {
    setShowRevision(true);
    setGeneratedCode('');
  };

  const useSampleIdea = (idea: any) => {
    setPrompt(idea.prompt);
  };

  return (
    <div className="space-y-6">
      {/* Project Input */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>Project Idea</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Describe your project:</label>
            <Textarea
              placeholder="e.g., Create a responsive todo app with HTML, CSS, and JavaScript..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {detectedLanguage && (
            <div className="flex items-center space-x-2">
              <span className="text-sm">Detected language:</span>
              <Badge variant="secondary" className="bg-accent/10 text-accent">
                {detectedLanguage}
              </Badge>
            </div>
          )}

          <Button 
            onClick={() => generateCode(prompt)}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating Code...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sample Ideas */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="w-5 h-5" />
            <span>Sample Project Ideas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleIdeas.map((idea, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => useSampleIdea(idea)}
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {idea.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{idea.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {idea.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated Code */}
      {generatedCode && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="w-5 h-5" />
              <span>Generated Code</span>
              <Badge variant="secondary" className="bg-success/10 text-success">
                {detectedLanguage}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-code-bg rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-green-400 whitespace-pre-wrap">
                <code>{generatedCode}</code>
              </pre>
            </div>

            <div className="flex space-x-3">
              <Button onClick={handleApprove} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                I'm happy with this
              </Button>
              <Button variant="outline" onClick={handleRevise} className="flex-1">
                <XCircle className="w-4 h-4 mr-2" />
                Revise prompt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectGenerator;