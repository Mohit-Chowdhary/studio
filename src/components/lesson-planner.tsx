
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wand2, Volume2, Mic, MicOff, BookOpen, FileText, Beaker, HelpCircle, Presentation, PenSquare, RotateCcw, ImageIcon, Camera, XCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateLessonPlanAction, textToSpeechAction, gradeDrawingAction } from "@/app/actions";
import type { GenerateLessonPlanOutput } from "@/ai/flows/generate-lesson-plan";
import type { GradeDrawingOutput } from "@/ai/flows/grade-drawing";
import { InteractiveQuiz } from "./interactive-quiz";
import { SlideshowCarousel } from "./slideshow-carousel";
import { Sketchpad } from "./sketch-pad";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  prompt: z.string().min(10, "Please describe your lesson plan requirements in at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

const ActivityContent = ({ activity }: { activity: GenerateLessonPlanOutput['plans'][0]['activities'][0] }) => {
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [audioSrc, setAudioSrc] = useState<string | null>(null);
    const [audioKey, setAudioKey] = useState(0);
    const [isGrading, setIsGrading] = useState(false);
    const [gradingResult, setGradingResult] = useState<GradeDrawingOutput | null>(null);
    const [sketchpadKey, setSketchpadKey] = useState(Date.now());
    const { toast } = useToast();

    const textContent = activity.content;

    const handleTextToSpeech = async () => {
        if (!textContent) return;
        setIsAudioLoading(true);
        setAudioSrc(null);

        const result = await textToSpeechAction(textContent);

        if ("error" in result) {
            toast({
                variant: "destructive",
                title: "Error Generating Audio",
                description: result.error,
            });
        } else {
            setAudioSrc(result.media);
            setAudioKey(key => key + 1);
        }
        setIsAudioLoading(false);
    };

    const handleDrawingSubmit = async (drawingDataUri: string) => {
        if (!activity.content) return;
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
        }
        setIsGrading(false);
    };

    const handleTryAgain = () => {
        setGradingResult(null);
        setSketchpadKey(Date.now()); // Re-mount the sketchpad to clear it
    };

    if (activity.format === 'drawing activity') {
        return (
            <div className="w-full space-y-4 flex flex-col items-center">
                 <div className="prose prose-sm max-w-none text-foreground rounded-md border bg-muted/20 p-4 w-full text-center">
                    <p className="font-semibold text-lg">{activity.content}</p>
                </div>

                {!gradingResult ? (
                    <Sketchpad key={sketchpadKey} onSubmit={handleDrawingSubmit} isSubmitting={isGrading} />
                ) : (
                    <Card className="w-full max-w-lg text-center shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline">Feedback</CardTitle>
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
            </div>
        )
    }

    if (activity.quiz) {
        return <InteractiveQuiz quiz={activity.quiz} topic={activity.title} />;
    }

    if (activity.slides) {
        return <SlideshowCarousel slides={activity.slides} />;
    }

    if (textContent) {
        return (
            <div className="w-full space-y-4">
                <div className="prose prose-sm max-w-none text-foreground rounded-md border bg-muted/20 p-4">
                    <ReactMarkdown>{textContent}</ReactMarkdown>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                      onClick={handleTextToSpeech}
                      disabled={isAudioLoading || !textContent}
                      variant="outline"
                      size="sm"
                    >
                      {isAudioLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Volume2 className="mr-2 h-4 w-4" />
                      )}
                      Read Aloud
                    </Button>
                    {audioSrc && (
                      <audio key={audioKey} controls autoPlay src={audioSrc} className="w-full max-w-md">
                        Your browser does not support the audio element.
                      </audio>
                    )}
                </div>
            </div>
        );
    }

    return <p className="text-muted-foreground">No content generated for this activity.</p>;
};

const formatToIcon = (format: string) => {
    switch (format) {
        case 'story': return <BookOpen className="w-4 h-4 text-primary" />;
        case 'worksheet': return <FileText className="w-4 h-4 text-primary" />;
        case 'quiz': return <HelpCircle className="w-4 h-4 text-primary" />;
        case 'explanation': return <Beaker className="w-4 h-4 text-primary" />;
        case 'visual aid': return <Presentation className="w-4 h-4 text-primary" />;
        case 'drawing activity': return <PenSquare className="w-4 h-4 text-primary" />;
        default: return <FileText className="w-4 h-4 text-primary" />;
    }
}


export default function LessonPlanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<GenerateLessonPlanOutput | null>(null);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

   useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      form.setValue('prompt', transcript, { shouldValidate: true });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast({
        variant: 'destructive',
        title: 'Speech Error',
        description: event.error === 'no-speech' ? 'No speech was detected.' : 'An error occurred. Please try again.',
      });
    };

    recognition.onend = () => setIsListening(false);
    speechRecognitionRef.current = recognition;
  }, [form, toast]);


  const handleListen = () => {
    if (!speechRecognitionRef.current) {
      toast({
        variant: 'destructive',
        title: 'Browser Not Supported',
        description: 'Speech recognition is not available in your browser.',
      });
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
    } else {
      setIsListening(true);
      speechRecognitionRef.current.start();
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: 'destructive',
          title: 'Image Too Large',
          description: 'Please select an image smaller than 4MB.',
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUri(reader.result as string);
      };
      reader.onerror = () => {
        toast({
          variant: 'destructive',
          title: 'Error Reading File',
          description: 'There was an issue uploading your image.',
        });
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setLessonPlan(null);
    
    const payload = { ...values, ...(photoDataUri && { photoDataUri }) };
    const result = await generateLessonPlanAction(payload);

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error Generating Lesson Plan",
        description: result.error,
      });
    } else {
      setLessonPlan(result);
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-3xl font-bold font-headline tracking-tight">AI Lesson Planner</h2>
        <p className="text-muted-foreground mt-1">
            Describe your teaching needs, and I'll create a full lesson plan with all the materials.
        </p>
        <div className="mt-6">
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Request</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Explain photosynthesis to a 7th grader. I need a detailed explanation with images and a short quiz."
                          rows={4}
                          {...field}
                          className="pr-12 text-base"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-2 h-8 w-8"
                        onClick={handleListen}
                        title={isListening ? "Stop listening" : "Use microphone"}
                      >
                        {isListening ? (
                          <MicOff className="text-red-500" />
                        ) : (
                          <Mic />
                        )}
                        <span className="sr-only">{isListening ? "Stop listening" : "Use microphone"}</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Add an Image (Optional)</FormLabel>
                <div className="flex flex-wrap gap-4 items-start">
                    <div className="flex gap-4">
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <ImageIcon className="mr-2" /> Upload Photo
                        </Button>
                        <input type="file" accept="image/*" capture="user" ref={cameraInputRef} onChange={handleImageChange} className="hidden" />
                        <Button type="button" variant="outline" onClick={() => cameraInputRef.current?.click()}>
                            <Camera className="mr-2" /> Use Camera
                        </Button>
                    </div>
                    {photoDataUri && (
                    <div className="relative mt-4 w-fit sm:mt-0">
                        <Image src={photoDataUri} alt="Lesson plan context" width={150} height={150} className="rounded-lg border-2 border-primary object-cover aspect-square shadow-md" />
                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setPhotoDataUri(null)}
                        >
                        <XCircle />
                        <span className="sr-only">Remove image</span>
                        </Button>
                    </div>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">Provide an image of a textbook page, diagram, or object for context. Max 4MB.</p>
              </div>


              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                size="lg"
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...</>
                ) : (
                  <><Wand2 className="mr-2 h-4 w-4" /> Generate Plan</>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
      
      {(isLoading || lessonPlan) && (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out">
            <Separator className="my-8" />
            <div>
                 <h2 className="text-3xl font-bold font-headline tracking-tight">Generated Lesson Plan</h2>
                <p className="text-muted-foreground mt-1">
                    Here is the AI-generated lesson plan based on your request.
                </p>
                <div className="mt-6 space-y-8">
                    {isLoading ? (
                        <div className="space-y-4 w-full">
                        <Skeleton className="w-1/2 h-8 rounded-lg" />
                        <Skeleton className="w-full h-24 rounded-lg" />
                        <Skeleton className="w-full h-24 rounded-lg" />
                        </div>
                    ) : (
                        lessonPlan?.plans.map((plan, planIndex) => (
                        <div key={planIndex} className="space-y-4 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                            <h3 className="text-2xl font-bold font-headline text-primary">
                                Plan for {plan.gradeLevel}: {plan.topic}
                            </h3>
                            <Accordion type="single" collapsible className="w-full" defaultValue={plan.activities[0]?.title}>
                            {plan.activities.map((activity, activityIndex) => (
                                <AccordionItem value={activity.title} key={activityIndex} className="border-b-0">
                                <AccordionTrigger className="text-lg font-medium hover:no-underline rounded-md px-4 py-3 -mx-4 hover:bg-muted/50 data-[state=open]:bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        {formatToIcon(activity.format)}
                                        <span>{activity.title} <span className="text-sm font-normal text-muted-foreground">({activity.format})</span></span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 bg-transparent">
                                    <ActivityContent activity={activity} />
                                </AccordionContent>
                                </AccordionItem>
                            ))}
                            </Accordion>
                        </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
