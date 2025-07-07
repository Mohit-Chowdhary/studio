import ContentGenerator from "@/components/content-generator";
import { BookOpen, Target, Palette, Languages } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline">
            SahayakAI
          </h1>
          <p className="mt-2 text-lg md:text-xl text-foreground/80">
            Your AI-powered assistant for creating localized teaching content.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                  <BookOpen className="text-primary" />
                  How to Get Started
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-foreground/90">
                <p>
                  Welcome, Teacher! SahayakAI is here to help you create engaging educational materials for your students. Just follow these simple steps:
                </p>
                <ul className="space-y-3 list-inside">
                  <li className="flex items-start gap-3">
                    <Target className="w-5 h-5 mt-1 text-accent shrink-0" />
                    <div>
                      <strong className="font-medium">Define Your Topic:</strong> Enter the subject you want to teach in the "Topic" field. Be as specific as you like!
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Languages className="w-5 h-5 mt-1 text-accent shrink-0" />
                    <div>
                      <strong className="font-medium">Choose a Language:</strong> Specify the language for the content to make it accessible to your students.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mt-1 text-accent shrink-0 lucide lucide-graduation-cap"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    <div>
                      <strong className="font-medium">Set the Grade Level:</strong> Enter a number for the grade level to tailor the complexity.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Palette className="w-5 h-5 mt-1 text-accent shrink-0" />
                    <div>
                      <strong className="font-medium">Select a Format:</strong> Pick a content format like a story, quiz, or worksheet that best suits your lesson plan.
                    </div>
                  </li>
                </ul>
                <p>
                  Click "Generate Content" and let the AI do the rest!
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <ContentGenerator />
          </div>
        </div>
      </div>
    </main>
  );
}
