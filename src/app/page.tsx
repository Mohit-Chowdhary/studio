
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookUser, GraduationCap, User, Bot } from "lucide-react";
import Link from "next/link";

export default function RoleSelectionPage() {
  return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <div className="flex flex-col items-center justify-center text-center w-full">
            <div className="mb-12 flex flex-col items-center gap-4">
                <Bot className="w-16 h-16 text-primary" />
                <h1 className="text-4xl font-bold font-headline tracking-tight sm:text-5xl">Welcome to SahayakAI</h1>
                <p className="text-muted-foreground mt-2 text-lg max-w-2xl">Your AI-powered teaching and learning companion. Please select your role to get started.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                <Link href="/teacher" passHref>
                    <Card className="text-center hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 cursor-pointer h-full flex flex-col">
                        <CardHeader>
                            <div className="mx-auto bg-primary/10 text-primary rounded-full w-20 h-20 flex items-center justify-center">
                                <BookUser className="w-10 h-10" />
                            </div>
                            <CardTitle className="pt-4 text-2xl">Teacher</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>Create lesson plans, set questions for your class, and grade assignments with AI assistance.</CardDescription>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/student" passHref>
                    <Card className="text-center hover:shadow-accent/20 hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 cursor-pointer h-full flex flex-col">
                        <CardHeader>
                            <div className="mx-auto bg-accent/10 text-accent rounded-full w-20 h-20 flex items-center justify-center">
                                <GraduationCap className="w-10 h-10" />
                            </div>
                            <CardTitle className="pt-4 text-2xl">Student</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>Join a classroom, answer questions on the virtual chalkboard, and get instant feedback on your work.</CardDescription>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/guest" passHref>
                    <Card className="text-center hover:shadow-secondary-foreground/10 hover:shadow-lg hover:-translate-y-1 transition-transform duration-300 cursor-pointer h-full flex flex-col">
                        <CardHeader>
                            <div className="mx-auto bg-secondary rounded-full w-20 h-20 flex items-center justify-center">
                            <User className="w-10 h-10" />
                            </div>
                            <CardTitle className="pt-4 text-2xl">Guest</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>Try out the combined teacher and student experience on a single page to see how it works.</CardDescription>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
      </main>
  );
}
