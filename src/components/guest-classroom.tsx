
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sketchpad } from "@/components/sketch-pad";
import { gradeDrawingAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { GradeDrawingOutput } from "@/ai/flows/grade-drawing";
import { RotateCcw, Lightbulb, User, BookUser } from "lucide-react";

export function GuestClassroom() {
  const [question, setQuestion] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isQuestionSet, setIsQuestionSet] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradeDrawingOutput | null>(null);
  const [sketchpadKey, setSketchpadKey] = useState(Date.now());

  const { toast } = useToast();

  const handleSetQuestion = () => {
    if (question.trim().length > 10) {
      setCurrentQuestion(question);
      setIsQuestionSet(true);
      setGradingResult(null);
      setSketchpadKey(Date.now());
    } else {
        toast({
            variant: "destructive",
            title: "Question Too Short",
            description: "Please enter a question with at least 10 characters.",
        });
    }
  };

  const handleReset = () => {
    setIsQuestionSet(false);
    setGradingResult(null);
    setQuestion("");
    setCurrentQuestion("");
    setSketchpadKey(Date.now());
  };

  const handleDrawingSubmit = async (drawingDataUri: string) => {
    if (!currentQuestion) return;
    setIsGrading(true);
    setGradingResult(null);

    const result = await gradeDrawingAction({
      question: currentQuestion,
      drawingDataUri,
    });

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error Grading Drawing",
        description: result.error,
      });
    } else {
      setGradingResult(result);
    }
    setIsGrading(false);
  };
  
  const handleTryAgain = () => {
    setGradingResult(null);
    setSketchpadKey(Date.now()); // Re-mount the sketchpad to clear it
  };


  return (
    <div className="space-y-8">
      {!isQuestionSet ? (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-headline text-2xl">
              <User className="w-8 h-8 text-primary" />
              Teacher's View
            </CardTitle>
            <CardDescription>
              Set a question for the student to answer on the virtual chalkboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question-input">Question</Label>
              <Textarea
                id="question-input"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Draw the three states of matter."
                rows={3}
                className="text-base"
              />
            </div>
            <Button onClick={handleSetQuestion}>Set Question</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                    <BookUser className="w-8 h-8 text-accent" />
                    Student's View
                    </CardTitle>
                    <div className="flex justify-between items-start pt-2">
                        <CardDescription>
                            The teacher has set a question. Draw your answer below.
                        </CardDescription>
                        <Button variant="outline" size="sm" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Ask New Question
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    <div className="prose prose-lg max-w-none text-foreground text-center rounded-md border bg-muted/30 p-4 w-full shadow-inner">
                        <p className="font-semibold text-xl">{currentQuestion}</p>
                    </div>
                    
                    {!gradingResult ? (
                        <Sketchpad key={sketchpadKey} onSubmit={handleDrawingSubmit} isSubmitting={isGrading} />
                    ) : (
                        <Card className="w-full max-w-lg text-center shadow-lg animate-in fade-in duration-500">
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center justify-center gap-2">
                                    <Lightbulb className="text-yellow-400" />
                                    AI Feedback
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className={`text-2xl font-bold ${gradingResult.isCorrect ? 'text-primary' : 'text-destructive'}`}>
                                    {gradingResult.isCorrect ? 'Great Job!' : 'Good Try!'}
                                </p>
                                <p className="text-foreground/80">{gradingResult.feedback}</p>
                                <Button onClick={handleTryAgain}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Try Again
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
