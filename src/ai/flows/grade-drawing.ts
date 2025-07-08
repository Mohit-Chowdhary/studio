'use server';
/**
 * @fileOverview An AI flow to grade a student's drawn answer.
 *
 * - gradeDrawing - A function that grades a drawing against a question.
 * - GradeDrawingInput - The input type for the gradeDrawing function.
 * - GradeDrawingOutput - The return type for the gradeDrawing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeDrawingInputSchema = z.object({
  question: z.string().describe('The question that was asked to the student.'),
  drawingDataUri: z
    .string()
    .describe(
      "The student's drawn answer, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GradeDrawingInput = z.infer<typeof GradeDrawingInputSchema>;

const GradeDrawingOutputSchema = z.object({
  isCorrect: z.boolean().describe("Whether the student's answer is substantially correct."),
  feedback: z.string().describe('Constructive feedback for the student about their drawing.'),
});
export type GradeDrawingOutput = z.infer<typeof GradeDrawingOutputSchema>;

export async function gradeDrawing(input: GradeDrawingInput): Promise<GradeDrawingOutput> {
  return gradeDrawingFlow(input);
}

const gradingPrompt = ai.definePrompt({
  name: 'gradeDrawingPrompt',
  input: {schema: GradeDrawingInputSchema},
  output: {schema: GradeDrawingOutputSchema},
  prompt: `You are a helpful and encouraging teaching assistant. A student was asked the following question: '{{question}}'.

They provided the drawing below as their answer. Please analyze their drawing.

1. Determine if the drawing correctly answers the question. Consider if the key components are present and correctly represented.
2. Provide brief, constructive, and encouraging feedback for the student. If they are incorrect, gently guide them towards the right answer. If they are correct, praise their work and perhaps suggest a small improvement or an extension thought.

Student's Answer Drawing:
{{media url=drawingDataUri}}`,
});

const gradeDrawingFlow = ai.defineFlow(
  {
    name: 'gradeDrawingFlow',
    inputSchema: GradeDrawingInputSchema,
    outputSchema: GradeDrawingOutputSchema,
  },
  async (input) => {
    const {output} = await gradingPrompt(input);
    return output!;
  }
);
