import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Code2,
  Zap
} from 'lucide-react';
import { ProjectData, TestResult } from './DevOpsAssistant';

interface TestRunnerProps {
  projectData: ProjectData;
  onTestsComplete: (tests: string, results: TestResult[]) => void;
}

const TestRunner: React.FC<TestRunnerProps> = ({ projectData, onTestsComplete }) => {
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [generatedTests, setGeneratedTests] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const generateTests = async () => {
    setIsGeneratingTests(true);
    
    // Simulate test generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    let tests = '';
    
    if (projectData.language.includes('Python')) {
      tests = `import unittest
import json
from app import app

class TestTaskAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_get_tasks(self):
        """Test getting all tasks"""
        response = self.app.get('/api/tasks')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_create_task(self):
        """Test creating a new task"""
        task_data = {
            "title": "Test Task",
            "completed": False
        }
        response = self.app.post('/api/tasks', 
                                json=task_data,
                                content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'Test Task')
        self.assertFalse(data['completed'])

    def test_update_task(self):
        """Test updating an existing task"""
        update_data = {
            "title": "Updated Task",
            "completed": True
        }
        response = self.app.put('/api/tasks/1', 
                               json=update_data,
                               content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['title'], 'Updated Task')
        self.assertTrue(data['completed'])

    def test_delete_task(self):
        """Test deleting a task"""
        response = self.app.delete('/api/tasks/1')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('message', data)

    def test_task_not_found(self):
        """Test updating non-existent task"""
        update_data = {"title": "Non-existent"}
        response = self.app.put('/api/tasks/999', 
                               json=update_data,
                               content_type='application/json')
        self.assertEqual(response.status_code, 404)

if __name__ == '__main__':
    unittest.main()`;
    } else {
      tests = `// Calculator Test Suite
describe('Calculator Tests', () => {
    let calculator;
    
    beforeEach(() => {
        document.body.innerHTML = \`
            <div class="calculator">
                <div class="display" id="display">0</div>
                <div class="buttons">
                    <!-- Calculator buttons -->
                </div>
            </div>
        \`;
        // Initialize calculator functions
    });

    describe('Display Functions', () => {
        test('should update display correctly', () => {
            appendToDisplay('5');
            expect(document.getElementById('display').textContent).toBe('5');
        });

        test('should clear display', () => {
            appendToDisplay('123');
            clearDisplay();
            expect(document.getElementById('display').textContent).toBe('0');
        });

        test('should delete last character', () => {
            appendToDisplay('123');
            deleteLast();
            expect(document.getElementById('display').textContent).toBe('12');
        });
    });

    describe('Basic Operations', () => {
        test('should perform addition correctly', () => {
            appendToDisplay('5');
            appendToDisplay('+');
            appendToDisplay('3');
            calculate();
            expect(document.getElementById('display').textContent).toBe('8');
        });

        test('should perform subtraction correctly', () => {
            appendToDisplay('10');
            appendToDisplay('-');
            appendToDisplay('4');
            calculate();
            expect(document.getElementById('display').textContent).toBe('6');
        });

        test('should perform multiplication correctly', () => {
            appendToDisplay('6');
            appendToDisplay('×');
            appendToDisplay('7');
            calculate();
            expect(document.getElementById('display').textContent).toBe('42');
        });

        test('should perform division correctly', () => {
            appendToDisplay('15');
            appendToDisplay('/');
            appendToDisplay('3');
            calculate();
            expect(document.getElementById('display').textContent).toBe('5');
        });
    });

    describe('Edge Cases', () => {
        test('should handle division by zero', () => {
            appendToDisplay('5');
            appendToDisplay('/');
            appendToDisplay('0');
            calculate();
            expect(document.getElementById('display').textContent).toBe('Infinity');
        });

        test('should handle invalid expressions', () => {
            appendToDisplay('5');
            appendToDisplay('+');
            appendToDisplay('+');
            calculate();
            expect(document.getElementById('display').textContent).toBe('Error');
        });

        test('should handle decimal operations', () => {
            appendToDisplay('3.5');
            appendToDisplay('+');
            appendToDisplay('2.5');
            calculate();
            expect(document.getElementById('display').textContent).toBe('6');
        });
    });
});`;
    }

    setGeneratedTests(tests);
    setIsGeneratingTests(false);
  };

  const runTests = async () => {
    setIsRunningTests(true);
    setTestProgress(0);

    const testCases: TestResult[] = [
      { name: 'Test Basic Functionality', status: 'pending' },
      { name: 'Test Edge Cases', status: 'pending' },
      { name: 'Test Error Handling', status: 'pending' },
      { name: 'Test User Interface', status: 'pending' },
      { name: 'Test Performance', status: 'pending' },
    ];

    setTestResults([...testCases]);

    // Simulate running tests
    for (let i = 0; i < testCases.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const success = Math.random() > 0.2; // 80% success rate
      const duration = Math.floor(Math.random() * 500) + 100;
      
      testCases[i] = {
        name: testCases[i].name,
        status: success ? 'pass' : 'fail',
        message: success ? 'Test passed successfully' : 'Assertion failed: Expected value to match',
        duration
      };

      setTestResults([...testCases]);
      setTestProgress(((i + 1) / testCases.length) * 100);
    }

    setIsRunningTests(false);
    onTestsComplete(generatedTests, testCases);
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'bg-success/10 text-success border-success/20',
      fail: 'bg-destructive/10 text-destructive border-destructive/20',
      pending: 'bg-muted/10 text-muted-foreground border-muted/20'
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;
  const totalTests = testResults.length;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TestTube className="w-5 h-5" />
            <span>Test Generation & Execution</span>
          </div>
          {totalTests > 0 && (
            <div className="flex space-x-2">
              <Badge className="bg-success/10 text-success border-success/20">
                {passedTests} Passed
              </Badge>
              {failedTests > 0 && (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                  {failedTests} Failed
                </Badge>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!generatedTests ? (
          <div className="text-center py-8">
            <TestTube className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Generate Test Cases</h3>
            <p className="text-muted-foreground mb-4">
              AI will generate comprehensive test cases for your code
            </p>
            <Button 
              onClick={generateTests}
              disabled={!projectData.code || isGeneratingTests}
              className="min-w-[140px]"
            >
              {isGeneratingTests ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Code2 className="w-4 h-4 mr-2" />
                  Generate Tests
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Generated Tests */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2">
                <Code2 className="w-4 h-4" />
                <span>Generated Test Code</span>
              </h4>
              <div className="bg-code-bg rounded-lg p-4 max-h-48 overflow-y-auto">
                <pre className="text-sm text-green-400 whitespace-pre-wrap">
                  <code>{generatedTests}</code>
                </pre>
              </div>
            </div>

            {/* Run Tests Button */}
            {!isRunningTests && testResults.length === 0 && (
              <Button onClick={runTests} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Run Test Suite
              </Button>
            )}

            {/* Test Progress */}
            {isRunningTests && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Running Tests...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(testProgress)}%</span>
                </div>
                <Progress value={testProgress} className="h-2" />
              </div>
            )}

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Test Results</span>
                </h4>
                <div className="space-y-2">
                  {testResults.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {getTestStatusIcon(test.status)}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {test.duration && (
                          <span className="text-xs text-muted-foreground">
                            {test.duration}ms
                          </span>
                        )}
                        <Badge variant="outline" className={getStatusBadge(test.status)}>
                          {test.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                {!isRunningTests && (
                  <Button 
                    variant="outline" 
                    onClick={runTests}
                    className="w-full"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-run Tests
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestRunner;