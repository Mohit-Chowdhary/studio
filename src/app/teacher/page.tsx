
'use client';

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookUser, PenSquare, HelpCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { generateContentAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const CLASSROOM_PREFIX = 'sahayak-classroom-';
const SUBMISSIONS_PREFIX = 'sahayak-submissions-';

type Submission = {
    studentName: string;
    type: 'drawing' | 'quiz';
    content?: string; // data URI for drawing
    feedback?: string;
    isCorrect?: boolean;
    score?: number;
    total?: number;
};

export default function TeacherPage() {
    const [activityType, setActivityType] = useState('drawing');
    const [question, setQuestion] = useState("");
    const [topic, setTopic] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [isRoomCreated, setIsRoomCreated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (!isRoomCreated || !roomCode) return;

        const submissionsKey = `${SUBMISSIONS_PREFIX}${roomCode}`;

        // Function to load submissions from local storage
        const loadSubmissions = () => {
             const existingSubmissions = localStorage.getItem(submissionsKey);
            if (existingSubmissions) {
                try {
                    setSubmissions(JSON.parse(existingSubmissions));
                } catch(e) {
                    console.error("Failed to parse submissions", e)
                    setSubmissions([]);
                }
            }
        }
       
        loadSubmissions();

        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === submissionsKey) {
                loadSubmissions();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isRoomCreated, roomCode]);

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
            
            // Clear any old submissions for this new room code
            localStorage.removeItem(`${SUBMISSIONS_PREFIX}${newRoomCode}`);

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
                            
                            <div className="mt-8 space-y-6 text-left">
                                <h3 className="text-xl font-semibold text-center">Live Submissions</h3>
                                {submissions.length === 0 ? (
                                    <p className="text-muted-foreground text-center">Waiting for students to submit their work...</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {submissions.map((sub, index) => (
                                            <Card key={index} className="text-left">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base">{sub.studentName}</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {sub.type === 'drawing' ? (
                                                        <div className="space-y-2">
                                                            {sub.content && <Image src={sub.content} alt={`Drawing by ${sub.studentName}`} width={200} height={150} className="rounded-md border object-cover w-full"/>}
                                                            {sub.feedback && (
                                                                <p className="text-xs text-muted-foreground pt-2">
                                                                    <span className={`font-bold ${sub.isCorrect ? 'text-primary' : 'text-destructive'}`}>AI Feedback: </span>
                                                                    {sub.feedback}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xl font-bold">{sub.score}/{sub.total} Correct</p>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    )
}
