
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

const SlideSchema = z.object({
  text: z
    .string()
    .describe(
      'The text for this slide. It should be concise and easy to read on a presentation slide.'
    ),
  imageUrl: z
    .string()
    .describe('The data URI of the generated image for this slide.'),
});

const QuizQuestionSchema = z.object({
  questionText: z.string().describe('The text of the quiz question.'),
  options: z.array(z.string()).min(4).max(4).describe('An array of 4 possible answers.'),
  correctAnswer: z.string().describe('The correct answer from the options array.'),
});

const QuizSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(3).max(5).describe('An array of 3-5 quiz questions.'),
});


const GenerateTeachingContentOutputSchema = z.object({
  content: z
    .string()
    .optional()
    .describe('The generated teaching content for non-slideshow formats.'),
  slides: z
    .array(SlideSchema)
    .optional()
    .describe('An array of slides for the visual aid.'),
  quiz: QuizSchema.optional().describe("The generated interactive quiz data."),
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

const generateSlideshowPrompt = ai.definePrompt({
  name: 'generateSlideshowPrompt',
  input: {schema: GenerateTeachingContentInputSchema},
  output: {
    schema: z.object({
      slides: z
        .array(
          z.object({
            text: z
              .string()
              .describe(
                'The text for this slide. It should be concise and easy to read on a presentation slide.'
              ),
            imagePrompt: z
              .string()
              .describe(
                'A detailed prompt for an image generation model to create a visual for this slide. The prompt should be descriptive and safe for work.'
              ),
          })
        )
        .describe('An array of 3 to 5 slides that break down the topic.'),
    }),
  },
  prompt: `You are an expert teacher creating a slideshow presentation. Your task is to break down the given topic into a series of 3 to 5 slides for the specified grade level and language.

  For each slide, provide:
  1.  Concise text content that explains a part of the topic.
  2.  A detailed prompt for an AI image generator to create a relevant visual aid.

  Language: {{{language}}}
  Grade Level: {{{gradeLevel}}}
  Topic: {{{topic}}}
  `,
});

const generateQuizPrompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateTeachingContentInputSchema},
  output: {schema: QuizSchema},
  prompt: `You are an expert teacher creating an interactive quiz. Your task is to generate a series of 3-5 multiple-choice questions on the given topic, suitable for the specified grade level and language.

  For each question, provide:
  1. The question text.
  2. Exactly four possible answer options.
  3. The correct answer, which must be one of the four options.

  Language: {{{language}}}
  Grade Level: {{{gradeLevel}}}
  Topic: {{{topic}}}
  `,
});

const generateTeachingContentFlow = ai.defineFlow(
  {
    name: 'generateTeachingContentFlow',
    inputSchema: GenerateTeachingContentInputSchema,
    outputSchema: GenerateTeachingContentOutputSchema,
  },
  async input => {
    if (input.format === 'visual aid') {
      const {output: slideshowContent} = await generateSlideshowPrompt(input);
      if (!slideshowContent || !slideshowContent.slides) {
        throw new Error('Failed to generate slideshow content.');
      }

      const slidePromises = slideshowContent.slides.map(async slide => {
        if (!slide.imagePrompt?.trim()) {
          return {
            text: slide.text,
            imageUrl: '',
          };
        }
        try {
          const {media} = await ai.generate({
            model: 'googleai/gemini-2.0-flash-preview-image-generation',
            prompt: slide.imagePrompt,
            config: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
          });

          return {
            text: slide.text,
            imageUrl: media?.url || '',
          };
        } catch (e) {
          console.error(`Error generating image for slide: ${slide.text}`, e);
          return {
            text: slide.text,
            imageUrl: '',
          };
        }
      });

      const slides = await Promise.all(slidePromises);

      return {
        slides,
      };
    } else if (input.format === 'quiz') {
      const {output} = await generateQuizPrompt(input);
      if (!output || !output.questions) {
        throw new Error('Failed to generate quiz content.');
      }
      return { quiz: output };
    }
    else {
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
