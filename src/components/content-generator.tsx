"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wand2 } from "lucide-react";

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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateContentAction } from "@/app/actions";

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

export default function ContentGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      language: "",
      gradeLevel: 1,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setGeneratedContent(null);
    
    const result = await generateContentAction(values);

    if ("error" in result) {
      toast({
        variant: "destructive",
        title: "Error Generating Content",
        description: result.error,
      });
    } else {
      setGeneratedContent(result.content);
    }

    setIsLoading(false);
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
                    <FormControl>
                      <Input placeholder="e.g., The Water Cycle" {...field} />
                    </FormControl>
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
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                {generatedContent}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
