
'use server';
/**
 * @fileOverview A Genkit flow for generating engaging social media captions.
 *
 * - suggestPostCaption - A function that handles the caption generation process.
 * - SuggestPostCaptionInput - The input type for the suggestPostCaption function.
 * - SuggestPostCaptionOutput - The return type for the suggestPostCaption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPostCaptionInputSchema = z.object({
  description: z
    .string()
    .optional()
    .describe('An optional text description for the post.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo for the post, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestPostCaptionInput = z.infer<typeof SuggestPostCaptionInputSchema>;

const SuggestPostCaptionOutputSchema = z.object({
  caption: z.string().describe('An engaging social media caption for the post.'),
});
export type SuggestPostCaptionOutput = z.infer<typeof SuggestPostCaptionOutputSchema>;

export async function suggestPostCaption(
  input: SuggestPostCaptionInput
): Promise<SuggestPostCaptionOutput> {
  return suggestPostCaptionFlow(input);
}

const captionPrompt = ai.definePrompt({
  name: 'captionPrompt',
  input: {schema: SuggestPostCaptionInputSchema},
  output: {schema: SuggestPostCaptionOutputSchema},
  prompt: `You are an expert social media manager who writes engaging and catchy captions for posts on a local business discovery platform called F-Moon.
Your goal is to create a compelling caption that will maximize user engagement for a user's post.

Input details:
{{#if description}}Description: {{{description}}}{{/if}}
{{#if photoDataUri}}Photo: {{media url=photoDataUri}}{{/if}}

Based on the provided information (either text description, an image, or both), suggest an engaging social media caption.
The caption should be concise, attention-grabbing, and suitable for a local community and business-focused platform. Ensure it encourages interaction and discovery. Do not include hashtags unless specifically requested in the description.`,
});

const suggestPostCaptionFlow = ai.defineFlow(
  {
    name: 'suggestPostCaptionFlow',
    inputSchema: SuggestPostCaptionInputSchema,
    outputSchema: SuggestPostCaptionOutputSchema,
  },
  async input => {
    const {output} = await captionPrompt(input);
    return output!;
  }
);
