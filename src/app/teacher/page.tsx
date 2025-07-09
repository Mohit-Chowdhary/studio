
'use client';

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookUser, PenSquare, HelpCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { generateContentAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const CLASSROOM_PREFIX = 'sahayak-classroom-';

export default function TeacherPage() {
    const [activityType, setActivityType] = useState('drawing');
    const [question, setQuestion] = useState("");
    const [topic, setTopic] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [isRoomCreated, setIsRoomCreated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCreateRoom = async () => {
        setIsLoading(true);
        const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        try {
            if (activityType === 'drawing') {
                if (question.trim().length < 10) {
                     toast({ variant: "destructive", title: "Question too short", description: "Please enter a question at least 10 characters long." });
                     setIsLoading(false);
                     return;
                }
                const roomData = { type: 'drawing', content: question, topic: question.slice(0, 50) + '...' };
                localStorage.setItem(`${CLASSROOM_PREFIX}${newRoomCode}`, JSON.stringify(roomData));
            } else { // quiz
                if (topic.trim().length < 3) {
                    toast({ variant: "destructive", title: "Topic too short", description: "Please enter a topic at least 3 characters long." });
                    setIsLoading(false);
                    return;
                }
                const result = await generateContentAction({
                    topic,
                    format: 'quiz',
                    gradeLevel: 5, // Using a default grade level for prototype
                    language: 'English' // Using a default language
                });

                if ('error' in result || !result.quiz) {
                    toast({ variant: "destructive", title: "Error Generating Quiz", description: result.error || "Could not generate a quiz for this topic." });
                    setIsLoading(false);
                    return;
                }
                
                const roomData = { type: 'quiz', content: result.quiz, topic: topic };
                localStorage.setItem(`${CLASSROOM_PREFIX}${newRoomCode}`, JSON.stringify(roomData));
            }

            setRoomCode(newRoomCode);
            setIsRoomCreated(true);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "An Unexpected Error Occurred", description: "Please try again." });
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <AppLayout title="Teacher Dashboard">
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-headline text-2xl">
                    <BookUser className="w-8 h-8 text-primary" />
                    Teacher's Dashboard
                    </CardTitle>
                    <CardDescription>
                        Create a new classroom, set an activity, and share the room code with your students.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!isRoomCreated ? (
                        <div className="space-y-4">
                            <Tabs value={activityType} onValueChange={setActivityType} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="drawing"><PenSquare className="mr-2"/> Drawing Question</TabsTrigger>
                                    <TabsTrigger value="quiz"><HelpCircle className="mr-2"/> Interactive Quiz</TabsTrigger>
                                </TabsList>
                                <TabsContent value="drawing" className="pt-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="question-input">Question for the Class</Label>
                                        <Textarea
                                            id="question-input"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            placeholder="e.g., Draw the three states of matter."
                                            rows={3}
                                            className="text-base"
                                        />
                                    </div>
                                </TabsContent>
                                <TabsContent value="quiz" className="pt-4 space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="topic-input">Topic for the Quiz</Label>
                                        <Input
                                            id="topic-input"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="e.g., The Solar System"
                                            className="text-base"
                                        />
                                    </div>
                                </TabsContent>
                            </Tabs>
                             <Button onClick={handleCreateRoom} disabled={isLoading}>
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                                ) : (
                                    "Create Classroom"
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center space-y-4 p-8 bg-muted/50 rounded-lg">
                            <h3 className="text-xl font-semibold">Classroom Created!</h3>
                            <p>Share this code with your students:</p>
                            <div className="bg-background inline-block p-4 rounded-lg border-2 border-dashed border-primary">
                                <p className="text-4xl font-bold tracking-widest text-primary">{roomCode}</p>
                            </div>
                            <p className="text-muted-foreground pt-4">Waiting for student submissions...</p>
                            <p className="text-xs text-muted-foreground">(In a real app, student answers would appear here in real-time.)</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    )
}
