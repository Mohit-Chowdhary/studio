
'use client';

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sketchpad } from "@/components/sketch-pad";
import { gradeDrawingAction } from "@/app/actions";
import type { GradeDrawingOutput } from "@/ai/flows/grade-drawing";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Lightbulb, RotateCcw } from "lucide-react";
import { useState } from "react";

export default function StudentPage() {
    const [roomCode, setRoomCode] = useState("");
    const [isJoined, setIsJoined] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState("");
    const [isGrading, setIsGrading] = useState(false);
    const [gradingResult, setGradingResult] = useState<GradeDrawingOutput | null>(null);
    const [sketchpadKey, setSketchpadKey] = useState(Date.now());
    const { toast } = useToast();

    const handleJoinRoom = () => {
        if (roomCode.trim().length < 6) return;
        // In a real app, this would fetch the question for the room code.
        // For this prototype, we'll use a hardcoded question.
        setCurrentQuestion("This is a placeholder question. In a real app, this would come from the teacher's room.");
        setIsJoined(true);
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
        <AppLayout title="Student Classroom">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                    <GraduationCap className="w-8 h-8 text-accent" />
                    Student's Classroom
                    </CardTitle>
                    <CardDescription>
                        {isJoined ? "The teacher has set a question. Draw your answer below." : "Enter the room code from your teacher to join the class."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    {!isJoined ? (
                        <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-lg border p-6">
                             <div className="space-y-2 text-center">
                                <Label htmlFor="room-code-input" className="text-base">Enter Room Code</Label>
                                <Input 
                                    id="room-code-input"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    placeholder="A1B2C3"
                                    className="text-2xl w-48 text-center font-mono tracking-widest h-14"
                                />
                            </div>
                            <Button onClick={handleJoinRoom} disabled={roomCode.trim().length < 6} className="w-full">Join Classroom</Button>
                        </div>
                    ) : (
                        <>
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
                        </>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    )
}
