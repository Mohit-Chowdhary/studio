"use client";

import { useState } from "react";
import { RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface GeneratedQuiz {
  questions: QuizQuestion[];
}

export function InteractiveQuiz({ quiz, topic }: { quiz: GeneratedQuiz, topic: string }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleNext = () => {
    // Score is updated when checking the answer
    setShowResult(false);
    setSelectedAnswer(null);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsFinished(true);
    }
  };
  
  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
    setShowResult(true);
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <Card className="text-center p-6 shadow-md w-full">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Quiz Complete!</CardTitle>
          <CardDescription>You've finished the quiz on "{topic}"</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-4xl font-bold text-primary">
            {score} / {quiz.questions.length}
          </p>
          <p className="text-lg text-foreground/80">Great job!</p>
          <Button onClick={handleRestart} size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-4">
        <p className="text-sm font-medium text-foreground/80">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
        <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="w-full h-2" />
      </div>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Quiz: {topic}</CardTitle>
          <CardDescription className="pt-4 text-lg text-foreground font-medium">{currentQuestion.questionText}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedAnswer ?? ""}
            onValueChange={setSelectedAnswer}
            disabled={showResult}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption = currentQuestion.correctAnswer === option;
              let itemClass = "";
              if (showResult && isSelected) {
                itemClass = isCorrect ? "bg-green-100 dark:bg-green-900/30 border-green-500" : "bg-red-100 dark:bg-red-900/30 border-red-500";
              } else if (showResult && isCorrectOption) {
                 itemClass = "bg-green-100 dark:bg-green-900/30 border-green-500";
              }

              return (
                <Label
                  key={index}
                  htmlFor={`option-${index}`}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-muted/50",
                    itemClass,
                    showResult && "cursor-not-allowed"
                  )}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrectOption && <CheckCircle className="ml-auto text-green-600" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="ml-auto text-red-600" />}
                </Label>
              );
            })}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-end">
            {!showResult ? (
                 <Button onClick={handleCheckAnswer} disabled={!selectedAnswer}>Check Answer</Button>
            ) : (
                <Button onClick={handleNext}>
                  {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </Button>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
