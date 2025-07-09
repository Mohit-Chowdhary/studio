
'use client';

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookUser } from "lucide-react";
import { useState } from "react";


export default function TeacherPage() {
    const [question, setQuestion] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [isRoomCreated, setIsRoomCreated] = useState(false);

    const handleCreateRoom = () => {
        if (question.trim().length < 10) return;
        // In a real app, this would call a server action to create a room
        // and get a unique code.
        const newRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setRoomCode(newRoomCode);
        setIsRoomCreated(true);
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
                        Create a new classroom, set a question, and share the room code with your students.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!isRoomCreated ? (
                        <div className="space-y-4">
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
                            <Button onClick={handleCreateRoom} disabled={question.trim().length < 10}>Create Classroom</Button>
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
