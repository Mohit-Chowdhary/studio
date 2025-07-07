// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Generates teaching content based on the specified language, grade level, and format.
 *
 * - generateTeachingContent - A function that generates teaching content.
 * - GenerateTeachingContentInput - The input type for the generateTeachingContent function.
 * - GenerateTeachingContentOutput - The return type for the generateTeachingContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTeachingContentInputSchema = z.object({
  language: z.string().describe('The language for the teaching content.'),
  gradeLevel: z.number().describe('The grade level for the teaching content.'),
  format: z
    .enum([
      'story',
      'worksheet',
      'quiz',
      'explanation',
      'visual aid',
    ])
    .describe('The format of the teaching content.'),
  topic: z.string().describe('The topic of the teaching content'),
});

export type GenerateTeachingContentInput = z.infer<
  typeof GenerateTeachingContentInputSchema
>;

const GenerateTeachingContentOutputSchema = z.object({
  content: z.string().describe('The generated teaching content.'),
});

export type GenerateTeachingContentOutput = z.infer<
  typeof GenerateTeachingContentOutputSchema
>;

export async function generateTeachingContent(
  input: GenerateTeachingContentInput
): Promise<GenerateTeachingContentOutput> {
  return generateTeachingContentFlow(input);
}

const generateTeachingContentPrompt = ai.definePrompt({
  name: 'generateTeachingContentPrompt',
  input: {schema: GenerateTeachingContentInputSchema},
  output: {schema: GenerateTeachingContentOutputSchema},
  prompt: `You are an expert teacher specializing in creating localized teaching content.

You will use the information provided to generate teaching content in the specified language, for the specified grade level, and in the specified format.

Language: {{{language}}}
Grade Level: {{{gradeLevel}}}
Format: {{{format}}}
Topic: {{{topic}}}

Content:`, // Ensure 'Content:' is present to guide the LLM to provide the actual content.
});

const generateTeachingContentFlow = ai.defineFlow(
  {
    name: 'generateTeachingContentFlow',
    inputSchema: GenerateTeachingContentInputSchema,
    outputSchema: GenerateTeachingContentOutputSchema,
  },
  async input => {
    const {output} = await generateTeachingContentPrompt(input);
    return output!;
  }
);
