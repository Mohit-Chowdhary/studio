import { AppLayout } from "@/components/app-layout";
import LessonPlanner from "@/components/lesson-planner";

export default function Page() {
  return (
    <AppLayout title="Lesson Planner">
      <LessonPlanner />
    </AppLayout>
  )
}
