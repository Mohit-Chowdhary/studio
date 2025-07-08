
"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wand2, CheckCircle, XCircle, RotateCcw, Volume2, Mic, MicOff } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateContentAction, textToSpeechAction } from "@/app/actions";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long."),
  language: z.string().min(2, "Please specify a language."),
  gradeLevel: z.coerce
    .number({ invalid_type_error: "Please enter a number." })
    .min(1, "Grade level must be between 1 and 12.")
    .max(12, "Grade level must be between 1 and 12."),
  format: z.enum([ 'story', 'worksheet', 'quiz', 'explanation', 'visual aid' ], {
    required_error: "You need to select a content format.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface GeneratedSlide {
  text: string;
  imageUrl: string;
}

interface QuizQuestion {
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface GeneratedQuiz {
  questions: QuizQuestion[];
}

interface GeneratedContent {
  content?: string;
  slides?: GeneratedSlide[];
  quiz?: GeneratedQuiz;
}

function InteractiveQuiz({ quiz, topic }: { quiz: GeneratedQuiz, topic: string }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleNext = () => {
    if (showResult && selectedAnswer === currentQuestion.correctAnswer) {
      setScore(prevScore => prevScore + 1);
    }
    
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


export default function ContentGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      language: "",
      gradeLevel: 1,
    },
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      form.setValue('topic', transcript, { shouldValidate: true });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast({
        variant: 'destructive',
        title: 'Speech Error',
        description: event.error === 'no-speech' ? 'No speech was detected.' : 'An error occurred. Please try again.',
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

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
      setIsListening(false);
    } else {
      setIsListening(true);
      speechRecognitionRef.current.start();
    }
  };


  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setGeneratedContent(null);
    setAudioData(null);
    
    const result = await generateContentAction(values);

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error Generating Content",
        description: result.error,
      });
    } else {
      setGeneratedContent(result);
    }

    setIsLoading(false);
  };
  
  const handleTextToSpeech = async () => {
    if (!generatedContent?.content) return;
    setIsAudioLoading(true);
    setAudioData(null);

    const result = await textToSpeechAction(generatedContent.content);

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error Generating Audio",
        description: result.error,
      });
    } else {
      setAudioData(result.media);
    }

    setIsAudioLoading(false);
  };


  return (
    <div className="space-y-8">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline">Create Your Content</CardTitle>
          <CardDescription>
            Fill out the form below to generate educational material tailored to your needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input
                          placeholder="e.g., The Water Cycle"
                          {...field}
                          className="pr-12"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Hindi, English" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gradeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="12" placeholder="e.g., 4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="worksheet">Worksheet</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="explanation">Explanation</SelectItem>
                        <SelectItem value="visual aid">Visual Aid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {(isLoading || generatedContent) && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline">Generated Content</CardTitle>
            <CardDescription>
              Here is the AI-generated material based on your selections.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {isLoading ? (
              <div className="space-y-4 w-full">
                <Skeleton className="w-full h-64 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ) : (
              generatedContent && (
                <>
                  {generatedContent.quiz ? (
                    <InteractiveQuiz quiz={generatedContent.quiz} topic={form.getValues('topic')} />
                  ) : generatedContent.slides && generatedContent.slides.length > 0 ? (
                    <Carousel className="w-full max-w-xl mx-auto">
                      <CarouselContent>
                        {generatedContent.slides.map((slide, index) => (
                          <CarouselItem key={index} className="flex flex-col items-center text-center">
                            <div className="p-1 space-y-4">
                                {slide.imageUrl ? (
                                  <Image
                                    src={slide.imageUrl}
                                    alt={`Slide ${index + 1} visual`}
                                    width={512}
                                    height={512}
                                    className="rounded-lg shadow-md aspect-square object-cover mx-auto"
                                    data-ai-hint="slideshow illustration"
                                  />
                                ) : (
                                  <div className="w-full max-w-[512px] aspect-square bg-muted rounded-lg flex items-center justify-center p-4">
                                    <p className="text-muted-foreground text-center">Image could not be generated for this slide.</p>
                                  </div>
                                )}
                                <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap pt-4">
                                  <p>{slide.text}</p>
                                </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious />
                      <CarouselNext />
                    </Carousel>
                  ) : generatedContent.content ? (
                    <div className="w-full space-y-4">
                      <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap rounded-md border bg-muted/20 p-4">
                        {generatedContent.content}
                      </div>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={handleTextToSpeech}
                          disabled={isAudioLoading || !generatedContent.content}
                          variant="outline"
                          size="sm"
                        >
                          {isAudioLoading ? (
                            <Loader2 className="mr-2" />
                          ) : (
                            <Volume2 className="mr-2" />
                          )}
                          Read Aloud
                        </Button>
                        {audioData && (
                          <audio controls src={audioData} className="w-full max-w-md">
                            Your browser does not support the audio element.
                          </audio>
                        )}
                      </div>
                    </div>
                  ) : null}
                </>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
