
'use client';

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sketchpad } from "@/components/sketch-pad";
import { InteractiveQuiz } from "@/components/interactive-quiz";
import { gradeDrawingAction } from "@/app/actions";
import type { GradeDrawingOutput } from "@/ai/flows/grade-drawing";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, Lightbulb, RotateCcw } from "lucide-react";
import { useState, useCallback } from "react";

const CLASSROOM_PREFIX = 'sahayak-classroom-';
const SUBMISSIONS_PREFIX = 'sahayak-submissions-';

interface Activity {
  type: 'drawing' | 'quiz';
  content: any;
  topic: string;
}

export default function StudentPage() {
    const [roomCode, setRoomCode] = useState("");
    const [studentName, setStudentName] = useState("");
    const [isJoined, setIsJoined] = useState(false);
    const [activity, setActivity] = useState<Activity | null>(null);
    const [isGrading, setIsGrading] = useState(false);
    const [gradingResult, setGradingResult] = useState<GradeDrawingOutput | null>(null);
    const [sketchpadKey, setSketchpadKey] = useState(Date.now());
    const { toast } = useToast();

    const saveSubmission = useCallback((submissionData: any) => {
        const submissionsKey = `${SUBMISSIONS_PREFIX}${roomCode}`;
        try {
            const existingSubmissionsRaw = localStorage.getItem(submissionsKey);
            const existingSubmissions = existingSubmissionsRaw ? JSON.parse(existingSubmissionsRaw) : [];
            
            // To prevent duplicates, we can filter out previous submissions from the same student
            const otherSubmissions = existingSubmissions.filter((s: any) => s.studentName !== studentName);
            const newSubmissions = [...otherSubmissions, submissionData];

            localStorage.setItem(submissionsKey, JSON.stringify(newSubmissions));
        } catch (error) {
            console.error("Failed to save submission to localStorage", error);
            toast({
                variant: "destructive",
                title: "Error Saving Submission",
                description: "Your work could not be submitted to the teacher.",
            });
        }
    }, [roomCode, studentName, toast]);


    const handleJoinRoom = () => {
        if (roomCode.trim().length < 6 || studentName.trim().length < 2) return;
        
        const upperCaseRoomCode = roomCode.toUpperCase();
        const roomDataString = localStorage.getItem(`${CLASSROOM_PREFIX}${upperCaseRoomCode}`);

        if (!roomDataString) {
            toast({
                variant: "destructive",
                title: "Room Not Found",
                description: "Please check the code and try again.",
            });
            return;
        }

        try {
            const roomData = JSON.parse(roomDataString);
            
            // Check for previous quiz submission
            if (roomData.type === 'quiz') {
                const submissionsKey = `${SUBMISSIONS_PREFIX}${upperCaseRoomCode}`;
                const existingSubmissionsRaw = localStorage.getItem(submissionsKey);
                if (existingSubmissionsRaw) {
                    const existingSubmissions = JSON.parse(existingSubmissionsRaw);
                    const mySubmission = existingSubmissions.find((s: any) => s.studentName === studentName);
                    if (mySubmission) {
                        toast({
                            variant: "default",
                            title: "Already Submitted",
                            description: "You have already completed the quiz for this room.",
                        });
                        return;
                    }
                }
            }

            setActivity(roomData);
            setIsJoined(true);

        } catch (error) {
             toast({
                variant: "destructive",
                title: "Error Joining Room",
                description: "Could not read classroom data. The data might be corrupted.",
            });
        }
    };
    
    const handleDrawingSubmit = async (drawingDataUri: string) => {
        if (!activity || activity.type !== 'drawing') return;
        setIsGrading(true);
        setGradingResult(null);

        const result = await gradeDrawingAction({
            question: activity.content,
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
            saveSubmission({
                studentName,
                type: 'drawing',
                content: drawingDataUri,
                feedback: result.feedback,
                isCorrect: result.isCorrect,
            });
        }
        setIsGrading(false);
    };

    const handleQuizComplete = (result: { score: number; total: number }) => {
        saveSubmission({
            studentName,
            type: 'quiz',
            score: result.score,
            total: result.total,
        });
    }

    const handleTryAgain = () => {
        setGradingResult(null);
        setSketchpadKey(Date.now()); // Re-mount the sketchpad to clear it
    };

    const renderActivity = () => {
        if (!activity) return null;

        switch (activity.type) {
            case 'drawing':
                return !gradingResult ? (
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
                            <p className="text-sm text-muted-foreground">Your answer has been sent to the teacher.</p>
                            <Button onClick={handleTryAgain}>
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                );
            case 'quiz':
                return <InteractiveQuiz quiz={activity.content} topic={activity.topic} onComplete={handleQuizComplete} />;
            default:
                return <p className="text-destructive">Unknown activity type.</p>;
        }
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
                        {isJoined ? "The teacher has set an activity for you." : "Enter your name and the room code from your teacher to join the class."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-6">
                    {!isJoined ? (
                        <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-lg border p-6">
                            <div className="w-full space-y-2">
                                <Label htmlFor="student-name-input" className="text-base">Your Name</Label>
                                <Input
                                    id="student-name-input"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="text-lg"
                                />
                            </div>
                             <div className="w-full space-y-2 text-center">
                                <Label htmlFor="room-code-input" className="text-base">Room Code</Label>
                                <Input 
                                    id="room-code-input"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    placeholder="A1B2C3"
                                    className="text-2xl w-48 text-center font-mono tracking-widest h-14 mx-auto"
                                />
                            </div>
                            <Button onClick={handleJoinRoom} disabled={roomCode.trim().length < 6 || studentName.trim().length < 2} className="w-full">Join Classroom</Button>
                        </div>
                    ) : (
                        <>
                            {activity?.type === 'drawing' && (
                                <div className="prose prose-lg max-w-none text-foreground text-center rounded-md border bg-muted/30 p-4 w-full shadow-inner">
                                    <p className="font-semibold text-xl">{activity.content}</p>
                                </div>
                            )}
                            
                            <div className="w-full flex justify-center">
                               {renderActivity()}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    )
}
