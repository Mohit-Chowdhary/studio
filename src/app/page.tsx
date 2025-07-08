import LessonPlanner from "@/components/lesson-planner";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary font-headline">
            SahayakAI
          </h1>
          <p className="mt-2 text-lg md:text-xl text-foreground/80">
            Your AI Teaching Assistant
          </p>
        </header>

        <LessonPlanner />
        
      </div>
    </main>
  );
}
