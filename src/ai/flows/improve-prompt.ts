'use server';

/**
 * @fileOverview This file contains a Genkit flow that suggests improvements to a given teaching content prompt.
 *
 * The flow takes a teaching content prompt as input and returns suggestions for improvement.
 * - improvePrompt - A function that handles the prompt improvement process.
 * - ImprovePromptInput - The input type for the improvePrompt function.
 * - ImprovePromptOutput - The return type for the improvePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImprovePromptInputSchema = z.object({
  prompt: z.string().describe('The teaching content prompt to improve.'),
});
export type ImprovePromptInput = z.infer<typeof ImprovePromptInputSchema>;

const ImprovePromptOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('Suggestions for improving the prompt.'),
});
export type ImprovePromptOutput = z.infer<typeof ImprovePromptOutputSchema>;

export async function improvePrompt(input: ImprovePromptInput): Promise<ImprovePromptOutput> {
  return improvePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improvePromptPrompt',
  input: {schema: ImprovePromptInputSchema},
  output: {schema: ImprovePromptOutputSchema},
  prompt: `You are an expert in crafting effective teaching content prompts. Your goal is to help a teacher create a more specific, detailed, and pedagogically sound request for an AI.

  Given the following prompt, provide a list of 3-4 concrete suggestions for improvement to get better, more detailed, and more curriculum-aligned results. Focus on adding specificity, mentioning formats, asking for real-world examples, and aligning with curriculum standards like CBSE.

  Prompt: {{{prompt}}}

  Suggestions:
  `,
});

const improvePromptFlow = ai.defineFlow(
  {
    name: 'improvePromptFlow',
    inputSchema: ImprovePromptInputSchema,
    outputSchema: ImprovePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
