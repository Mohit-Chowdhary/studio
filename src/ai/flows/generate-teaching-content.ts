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
  content: z
    .string()
    .describe(
      'The generated teaching content. For a visual aid, this is the description.'
    ),
  imageUrl: z
    .string()
    .optional()
    .describe('The data URI of the generated image for a visual aid.'),
});

export type GenerateTeachingContentOutput = z.infer<
  typeof GenerateTeachingContentOutputSchema
>;

export async function generateTeachingContent(
  input: GenerateTeachingContentInput
): Promise<GenerateTeachingContentOutput> {
  return generateTeachingContentFlow(input);
}

const generateContentPrompt = ai.definePrompt({
  name: 'generateContentPrompt',
  input: {schema: GenerateTeachingContentInputSchema},
  output: {schema: z.object({content: z.string()})},
  prompt: `You are an expert teacher specializing in creating localized teaching content.

  You will use the information provided to generate teaching content in the specified language, for the specified grade level, and in the specified format.

  Language: {{{language}}}
  Grade Level: {{{gradeLevel}}}
  Format: {{{format}}}
  Topic: {{{topic}}}

  Content:`,
});

const generateVisualAidDescriptionPrompt = ai.definePrompt({
  name: 'generateVisualAidDescriptionPrompt',
  input: {schema: GenerateTeachingContentInputSchema},
  output: {schema: z.object({content: z.string()})},
  prompt: `You are an expert teacher specializing in creating localized teaching content. Your task is to generate a detailed, descriptive text that can be used as a prompt for an image generation model. This image will be a visual aid for the given topic, language and grade level. The description should be vivid and clear so an AI can draw it accurately. Make the description safe for work and children friendly.

  Language: {{{language}}}
  Grade Level: {{{gradeLevel}}}
  Topic: {{{topic}}}

  Image Description:`,
});

const generateTeachingContentFlow = ai.defineFlow(
  {
    name: 'generateTeachingContentFlow',
    inputSchema: GenerateTeachingContentInputSchema,
    outputSchema: GenerateTeachingContentOutputSchema,
  },
  async input => {
    if (input.format === 'visual aid') {
      const {output: descriptionOutput} =
        await generateVisualAidDescriptionPrompt(input);
      if (!descriptionOutput) {
        throw new Error('Failed to generate image description.');
      }

      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: descriptionOutput.content,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      return {
        content: `This visual aid illustrates: ${descriptionOutput.content}`,
        imageUrl: media?.url,
      };
    } else {
      const {output} = await generateContentPrompt(input);
      if (!output) {
        throw new Error('Failed to generate content.');
      }
      return {
        content: output.content,
      };
    }
  }
);