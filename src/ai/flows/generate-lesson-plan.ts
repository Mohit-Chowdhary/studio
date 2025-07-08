
'use server';

/**
 * @fileOverview Generates a complete, multi-format lesson plan from a single natural language prompt.
 *
 * - generateLessonPlan - A function that generates a lesson plan with activities for one or more grade levels.
 * - GenerateLessonPlanInput - The input type for the generateLessonPlan function.
 * - GenerateLessonPlanOutput - The return type for the generateLessonPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schemas copied from generate-teaching-content.ts to be self-contained
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
// End of copied schemas

const ActivitySchema = z.object({
  title: z.string().describe('A short, descriptive title for this activity.'),
  format: z.enum(['story', 'worksheet', 'quiz', 'explanation', 'visual aid', 'drawing activity']).describe('The format of the generated content for this activity.'),
  content: z.string().optional().describe('The generated text-based content (for story, worksheet, explanation, or a question for a drawing activity).'),
  quiz: QuizSchema.optional().describe('The generated quiz content.'),
  slides: z.array(SlideSchema).optional().describe('The generated slides for a visual aid.'),
});

const SingleGradeLessonPlanSchema = z.object({
  gradeLevel: z.string().describe('The grade level this lesson plan is for (e.g., "Class 3", "Grade 5").'),
  topic: z.string().describe('The overall topic for this lesson plan.'),
  activities: z.array(ActivitySchema).describe('An array of generated activities for this lesson plan.'),
});

const GenerateLessonPlanInputSchema = z.object({
  prompt: z.string().describe('The natural language prompt from the teacher describing their needs.'),
  photoDataUri: z.string().optional().describe("A photo for context, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const GenerateLessonPlanOutputSchema = z.object({
  plans: z.array(SingleGradeLessonPlanSchema),
});
export type GenerateLessonPlanOutput = z.infer<typeof GenerateLessonPlanOutputSchema>;


export async function generateLessonPlan(
  input: GenerateLessonPlanInput
): Promise<GenerateLessonPlanOutput> {
  return generateLessonPlanFlow(input);
}


// This is a complex prompt that instructs the AI to act as an autonomous agent.
const lessonPlannerPrompt = ai.definePrompt({
    name: 'lessonPlannerPrompt',
    input: { schema: GenerateLessonPlanInputSchema },
    output: {
      schema: z.object({
        plans: z.array(
          z.object({
            gradeLevel: z.string(),
            topic: z.string(),
            activities: z.array(
              z.object({
                title: z.string(),
                format: z.enum(['story', 'worksheet', 'quiz', 'explanation', 'visual aid', 'drawing activity']),
                // For text formats, we generate the content directly.
                content: z.string().optional(),
                // For quiz, we generate the structure.
                quiz: QuizSchema.optional(),
                // For visual aids, we generate slide text and image prompts to be processed later.
                slides: z.array(z.object({
                    text: z.string(),
                    imagePrompt: z.string().describe("A detailed, SFW prompt for an image generation model to create a visual for this slide.")
                })).optional(),
              })
            ),
          })
        ),
      }),
    },
    prompt: `You are an expert curriculum designer and AI teaching assistant with deep pedagogical knowledge, specializing in the CBSE curriculum used in India. Your primary goal is to create exceptionally detailed, engaging, and age-appropriate lesson plans that go beyond basic outlines. Your plans should feel like they were crafted by a master teacher.

**Core Instructions:**

1.  **Analyze the Request:** Carefully dissect the teacher's prompt. Identify the core topic(s), target grade level(s) (e.g., Class 3, Class 5), and any specified languages or formats. If a language is specified, all generated content must be in that language. Your tone should be encouraging and professional.

2.  **Emulate CBSE Standards:** Your content must reflect the depth and structure of the CBSE curriculum. When generating content, think about how the topic is presented in popular CBSE textbooks. Use relevant terminology, examples, and structured exercises that would be familiar to a student in that system.

3.  **Generate Rich, Detailed Content:** Do not provide simple, one-paragraph answers. Each activity should be comprehensive.
    *   **For 'story':** Write a complete, engaging narrative with a beginning, middle, and end. The story should be at least 300 words and weave in the educational concepts seamlessly.
    *   **For 'worksheet':** Create a multi-part worksheet. Include different types of questions, such as fill-in-the-blanks, multiple choice, short answer questions, and matching exercises. Make it a complete, ready-to-print resource.
    *   **For 'explanation':** Provide a thorough explanation. Start with a simple analogy or real-world example suitable for the grade level. Break down the topic into smaller, digestible parts with clear headings. Use bullet points and bold text to highlight key terms.
    *   **For 'drawing activity':** Provide a very specific prompt that encourages detailed scientific or explanatory drawing (e.g., 'Draw a detailed diagram of a plant cell, labeling the nucleus, cell wall, cytoplasm, and chloroplasts.'). The output should be in the 'content' field.
    *   **For 'quiz':** Generate a challenging 3-5 question multiple-choice quiz. The questions should test understanding, not just recall. Include plausible distractors for the incorrect options.
    *   **For 'visual aid':** Generate a series of 3-5 slides. Each slide must have concise, informative text and a highly detailed, descriptive 'imagePrompt' for an AI image generator to create a vivid and accurate illustration.

4.  **Handle Image Context (If Provided):**
    {{#if photoDataUri}}
    An image has been provided. Analyze it carefully. If it's a page from a textbook (e.g., a CBSE science book), use its specific content, diagrams, and key terms as the primary source for the lesson plan. If it's an object or scene, build the entire lesson around it, connecting it to relevant curriculum topics.
    Image Context: {{media url=photoDataUri}}
    {{/if}}

5.  **Structure the Plan:** For each grade level identified, create a tailored lesson plan with 2-4 diverse and complementary activities.

**Teacher's Prompt:** "{{{prompt}}}"

Produce the final, detailed lesson plan in the structured format requested. Ensure every piece of content is of the highest quality and ready for classroom use.`,
  });


const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: GenerateLessonPlanOutputSchema,
  },
  async (input) => {
    // Step 1: Call the planner LLM to get the structured plan and content.
    const { output: planOutput } = await lessonPlannerPrompt(input);
    if (!planOutput || !planOutput.plans) {
      throw new Error('Failed to generate a lesson plan structure.');
    }

    // Step 2: Process the plan to generate images for visual aids.
    const processedPlans = await Promise.all(
        planOutput.plans.map(async (plan) => {
            const processedActivities = await Promise.all(
                plan.activities.map(async (activity) => {
                    if (activity.format === 'visual aid' && activity.slides) {
                        const slidePromises = activity.slides.map(async (slide) => {
                           if (!slide.imagePrompt?.trim()) {
                                return { text: slide.text, imageUrl: '' };
                            }
                            try {
                                const { media } = await ai.generate({
                                    model: 'googleai/gemini-2.0-flash-preview-image-generation',
                                    prompt: slide.imagePrompt,
                                    config: { responseModalities: ['TEXT', 'IMAGE'] },
                                });
                                return { text: slide.text, imageUrl: media?.url || '' };
                            } catch (e) {
                                console.error(`Error generating image for slide: ${slide.text}`, e);
                                return { text: slide.text, imageUrl: '' }; // Gracefully fail
                            }
                        });
                        const generatedSlides = await Promise.all(slidePromises);
                        // Return a new activity object with imageUrls instead of imagePrompts
                        return { ...activity, slides: generatedSlides, quiz: undefined, content: undefined };
                    }
                    return activity;
                })
            );
            return { ...plan, activities: processedActivities };
        })
    );

    return { plans: processedPlans };
  }
);
