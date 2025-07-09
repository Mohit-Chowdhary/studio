import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Lightbulb, MonitorPlay, Settings, Users, Volume2, Wand2 } from "lucide-react";

const features = [
    {
        icon: <Wand2 className="h-8 w-8 text-primary" />,
        title: "AI Lesson Planner",
        description: "Generate comprehensive, multi-format lesson plans from a single prompt. Specify topics, grade levels, and languages to receive detailed content tailored to your needs, with a focus on CBSE curriculum standards."
    },
    {
        icon: <BookOpen className="h-8 w-8 text-primary" />,
        title: "Diverse Activity Generation",
        description: "Create a variety of classroom materials including engaging stories, in-depth visual aids with AI-generated images, structured worksheets, interactive quizzes, and creative drawing prompts."
    },
    {
        icon: <MonitorPlay className="h-8 w-8 text-primary" />,
        title: "Live Classroom Simulation",
        description: "Experience a simulated classroom environment. Teachers can create a 'room', set activities (drawing or quizzes), and view student submissions in real-time. Students can join rooms and submit their work."
    },
    {
        icon: <Lightbulb className="h-8 w-8 text-primary" />,
        title: "AI-Powered Grading & Feedback",
        description: "Receive instant, constructive feedback on student work. The AI can grade drawings submitted on the virtual chalkboard and provide scores for interactive quizzes."
    },
    {
        icon: <Volume2 className="h-8 w-8 text-primary" />,
        title: "Text-to-Speech",
        description: "Convert generated text content into natural-sounding audio, making lessons more accessible and engaging for all types of learners."
    },
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: "Role-Based UI",
        description: "Separate, dedicated interfaces for Teachers, Students, and a Guest mode to provide a focused and intuitive experience for each user type."
    },
    {
        icon: <Settings className="h-8 w-8 text-primary" />,
        title: "Customizable Preferences",
        description: "Personalize your experience by saving default grade levels, preferred subjects, language, and theme (including Dark Mode)."
    }
];

const technologies = [
    "Next.js (App Router)",
    "React",
    "TypeScript",
    "Genkit",
    "Google Gemini",
    "Tailwind CSS",
    "ShadCN UI",
    "Radix UI",
    "Zod",
    "React Hook Form",
];


export default function FeaturesPage() {
    return (
        <AppLayout title="Features & Technology">
            <div className="space-y-12">
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Key Features</CardTitle>
                        <CardDescription>An overview of SahayakAI's core capabilities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature) => (
                                <div key={feature.title} className="flex items-start space-x-4 rounded-lg p-4 transition-colors hover:bg-muted/50">
                                    <div className="mt-1">{feature.icon}</div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{feature.title}</h3>
                                        <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="font-headline text-3xl">Technology Stack</CardTitle>
                        <CardDescription>The frameworks, libraries, and services that power this application.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                       {technologies.map((tech) => (
                            <Badge key={tech} variant="secondary" className="text-sm font-medium py-1 px-3">
                                {tech}
                            </Badge>
                       ))}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}