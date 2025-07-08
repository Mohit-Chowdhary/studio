
'use server';

import {
  generateTeachingContent,
  type GenerateTeachingContentInput,
  type GenerateTeachingContentOutput,
} from '@/ai/flows/generate-teaching-content';
import { textToSpeech, type TextToSpeechOutput } from '@/ai/flows/text-to-speech';
import { generateLessonPlan, type GenerateLessonPlanInput, type GenerateLessonPlanOutput } from '@/ai/flows/generate-lesson-plan';
import { gradeDrawing, type GradeDrawingInput, type GradeDrawingOutput } from '@/ai/flows/grade-drawing';

export async function generateContentAction(
  input: GenerateTeachingContentInput
): Promise<GenerateTeachingContentOutput | { error: string }> {
  try {
    const result = await generateTeachingContent(input);
    if (!result || (!result.content && (!result.slides || result.slides.length === 0) && !result.quiz)) {
      throw new Error('Failed to generate content. The AI model returned an empty response.');
    }
    return result;
  } catch (error) {
    console.error('Error generating teaching content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `An unexpected error occurred: ${errorMessage}. Please try again later.` };
  }
}

export async function textToSpeechAction(
  text: string
): Promise<TextToSpeechOutput | { error: string }> {
  try {
    const result = await textToSpeech(text);
    if (!result || !result.media) {
      throw new Error('Failed to generate audio. The AI model returned an empty response.');
    }
    return result;
  } catch (error) {
    console.error('Error generating audio:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `An unexpected error occurred: ${errorMessage}. Please try again later.` };
  }
}

export async function generateLessonPlanAction(
  input: GenerateLessonPlanInput
): Promise<GenerateLessonPlanOutput | { error: string }> {
  try {
    const result = await generateLessonPlan(input);
    if (!result || !result.plans || result.plans.length === 0) {
      throw new Error('Failed to generate lesson plan. The AI model returned an empty response.');
    }
    return result;
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `An unexpected error occurred: ${errorMessage}. Please try again later.` };
  }
}

export async function gradeDrawingAction(
  input: GradeDrawingInput
): Promise<GradeDrawingOutput | { error: string }> {
  try {
    const result = await gradeDrawing(input);
    if (!result || !result.feedback) {
      throw new Error('Failed to grade drawing. The AI model returned an empty response.');
    }
    return result;
  } catch (error) {
    console.error('Error grading drawing:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `An unexpected error occurred: ${errorMessage}. Please try again later.` };
  }
}
