'use server';
/**
 * @fileOverview A Genkit flow for generating attractive and informative business descriptions.
 *
 * - generateBusinessDescription - A function that handles the business description generation process.
 * - GenerateBusinessDescriptionInput - The input type for the generateBusinessDescription function.
 * - GenerateBusinessDescriptionOutput - The return type for the generateBusinessDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBusinessDescriptionInputSchema = z.object({
  businessCategory: z.string().describe('The category of the business (e.g., "hotel", "restaurant", "retail shop").'),
  businessOfferings: z.string().describe('A description of the business\'s specific products or services (e.g., "fine dining with Ethiopian cuisine", "handmade leather goods", "accommodation with spa services").')
});
export type GenerateBusinessDescriptionInput = z.infer<typeof GenerateBusinessDescriptionInputSchema>;

const GenerateBusinessDescriptionOutputSchema = z.object({
  description: z.string().describe('An attractive and informative business description.')
});
export type GenerateBusinessDescriptionOutput = z.infer<typeof GenerateBusinessDescriptionOutputSchema>;

export async function generateBusinessDescription(input: GenerateBusinessDescriptionInput): Promise<GenerateBusinessDescriptionOutput> {
  return generateBusinessDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBusinessDescriptionPrompt',
  input: { schema: GenerateBusinessDescriptionInputSchema },
  output: { schema: GenerateBusinessDescriptionOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an AI assistant specialized in crafting compelling business descriptions for local Ethiopian businesses.
Your goal is to create an attractive and informative description based on the provided business category and offerings.
The description should be engaging, highlight unique selling points, and clearly communicate what the business offers to potential customers in Ethiopia.
Keep the description concise but comprehensive, suitable for a social media business profile.

Business Category: {{{businessCategory}}}
Business Offerings: {{{businessOfferings}}}

Generate a business description in a friendly and professional tone. The output must be a valid JSON object.`
});

const generateBusinessDescriptionFlow = ai.defineFlow(
  {
    name: 'generateBusinessDescriptionFlow',
    inputSchema: GenerateBusinessDescriptionInputSchema,
    outputSchema: GenerateBusinessDescriptionOutputSchema
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate business description');
    return output;
  }
);
