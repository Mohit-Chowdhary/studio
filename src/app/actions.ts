'use server';

import {
  generateTeachingContent,
  type GenerateTeachingContentInput,
  type GenerateTeachingContentOutput,
} from '@/ai/flows/generate-teaching-content';

export async function generateContentAction(
  input: GenerateTeachingContentInput
): Promise<GenerateTeachingContentOutput | { error: string }> {
  try {
    const result = await generateTeachingContent(input);
    if (!result || (!result.content && (!result.slides || result.slides.length === 0))) {
      throw new Error('Failed to generate content. The AI model returned an empty response.');
    }
    return result;
  } catch (error) {
    console.error('Error generating teaching content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `An unexpected error occurred: ${errorMessage}. Please try again later.` };
  }
}
