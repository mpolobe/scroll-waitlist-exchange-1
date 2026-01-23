/**
 * Africa Railways Quiz Component
 * 4/5 correct answers required to unlock 10M SENT Quiz Pool
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  HelpCircle, 
  CheckCircle, 
  XCircle, 
  Trophy,
  ArrowRight,
  RotateCcw
} from "lucide-react";

// Quiz Questions about Africa Railways
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary token used for Africa Railways transactions?",
    options: [
      { id: "a", text: "AFRC (Africoin)" },
      { id: "b", text: "SENT (Sentinel)" },
      { id: "c", text: "ETH (Ethereum)" },
      { id: "d", text: "BTC (Bitcoin)" }
    ],
    correctAnswer: "a"
  },
  {
    id: 2,
    question: "Which blockchain network does the SENT token operate on?",
    options: [
      { id: "a", text: "Ethereum Mainnet" },
      { id: "b", text: "Binance Smart Chain" },
      { id: "c", text: "Polygon Mainnet" },
      { id: "d", text: "Solana" }
    ],
    correctAnswer: "c"
  },
  {
    id: 3,
    question: "What is the total SENT airdrop allocation for the community?",
    options: [
      { id: "a", text: "100 Million SENT" },
      { id: "b", text: "210 Million SENT" },
      { id: "c", text: "310 Million SENT" },
      { id: "d", text: "500 Million SENT" }
    ],
    correctAnswer: "c"
  },
  {
    id: 4,
    question: "What role do 'Sentinels' play in the Africa Railways ecosystem?",
    options: [
      { id: "a", text: "They are investors only" },
      { id: "b", text: "Track workers who submit verified reports" },
      { id: "c", text: "They manage social media" },
      { id: "d", text: "They are train conductors" }
    ],
    correctAnswer: "b"
  },
  {
    id: 5,
    question: "How many referrals are needed to qualify for the 50M Referral Pool?",
    options: [
      { id: "a", text: "1 referral" },
      { id: "b", text: "2 referrals" },
      { id: "c", text: "3 or more referrals" },
      { id: "d", text: "10 referrals" }
    ],
    correctAnswer: "c"
  }
];

interface AfricaRailwaysQuizProps {
  walletAddress: string;
  onComplete?: (passed: boolean, score: number) => void;
}

export function AfricaRailwaysQuiz({ walletAddress, onComplete }: AfricaRailwaysQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleAnswer = (questionId: number, answerId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleNext = () => {
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    // Calculate score
    let correct = 0;
    QUIZ_QUESTIONS.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    
    const finalScore = correct;
    const percentage = (correct / QUIZ_QUESTIONS.length) * 100;
    setScore(finalScore);
    
    // Submit to API - 4/5 (80%) qualifies for Quiz Pool
    try {
      const response = await fetch("/api/airdrop/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, score: percentage })
      });
      const result = await response.json();
      if (!result.success) {
        console.error("Failed to submit quiz score:", result.error);
      }
    } catch (err) {
      console.error("Failed to submit quiz score:", err);
    }
    
    setShowResults(true);
    setSubmitting(false);
    
    // Callback - 4/5 or better passes
    onComplete?.(finalScore >= 4, finalScore);
    
    // Auto-restart quiz after 3 seconds if failed
    if (finalScore < 4) {
      setTimeout(() => {
        setCurrentQuestion(0);
        setAnswers({});
        setShowResults(false);
        setScore(0);
      }, 3000);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  const question = QUIZ_QUESTIONS[currentQuestion];
  const allAnswered = Object.keys(answers).length === QUIZ_QUESTIONS.length;
  const passed = score >= 4;

  // Results Screen
  if (showResults) {
    return (
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            {passed ? (
              <>
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-yellow-500" />
                </div>
                <h2 className="text-2xl font-bold text-green-600">Quiz Passed!</h2>
                <p className="text-lg">You scored {score}/5 ({(score / 5 * 100).toFixed(0)}%)</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">
                    You're now eligible for the 10M SENT Quiz Pool!
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Top 100 scorers will receive bonus SENT tokens
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-red-600">Not Quite!</h2>
                <p className="text-lg">You scored {score}/5</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">
                    You need at least 4/5 correct to qualify for the Quiz Pool
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    Restarting quiz in 3 seconds...
                  </p>
                </div>
              </>
            )}

            {/* Show correct answers */}
            <div className="mt-6 text-left">
              <h3 className="font-semibold mb-3">Answer Review:</h3>
              <div className="space-y-2">
                {QUIZ_QUESTIONS.map((q, idx) => {
                  const userAnswer = answers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  const correctOption = q.options.find(o => o.id === q.correctAnswer);
                  
                  return (
                    <div key={q.id} className={`p-2 rounded text-sm ${
                      isCorrect ? "bg-green-50" : "bg-red-50"
                    }`}>
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">Q{idx + 1}:</span>
                        <span className={isCorrect ? "text-green-700" : "text-red-700"}>
                          {correctOption?.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz Questions
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-yellow-500" />
            Africa Railways Quiz
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
          </span>
        </div>
        <CardDescription>
          Score at least 4/5 to qualify for the 10M SENT Quiz Pool
        </CardDescription>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all"
            style={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question */}
        <div>
          <h3 className="text-lg font-medium mb-4">{question.question}</h3>
          
          <RadioGroup
            value={answers[question.id] || ""}
            onValueChange={(value) => handleAnswer(question.id, value)}
            className="space-y-3"
          >
            {question.options.map((option) => (
              <div
                key={option.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  answers[question.id] === option.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <RadioGroupItem value={option.id} id={`q${question.id}-${option.id}`} />
                <Label 
                  htmlFor={`q${question.id}-${option.id}`}
                  className="flex-1 cursor-pointer"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          {currentQuestion === QUIZ_QUESTIONS.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!answers[question.id]}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AfricaRailwaysQuiz;
