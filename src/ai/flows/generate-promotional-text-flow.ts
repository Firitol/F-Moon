'use server';
/**
 * @fileOverview A Genkit flow for generating promotional text for business owners.
 *
 * - generatePromotionalText - A function that handles the generation of promotional text.
 * - GeneratePromotionalTextInput - The input type for the generatePromotionalText function.
 * - GeneratePromotionalTextOutput - The return type for the generatePromotionalText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePromotionalTextInputSchema = z.object({
  businessName: z.string().describe('The name of the business.'),
  businessCategory: z
    .string()
    .describe('The category of the business (e.g., hotel, shop, service).'),
  productServiceDescription: z
    .string()
    .describe('A brief description of the product or service being promoted.'),
  targetAudience: z
    .string()
    .optional()
    .describe('The target audience for this promotion (e.g., young professionals, families).'),
  callToAction: z
    .string()
    .optional()
    .describe('The desired call to action (e.g., "Visit our store", "Order now", "Book a table").'),
  keywords: z.array(z.string()).optional().describe('Optional keywords to include in the text.'),
  promotionGoal: z
    .string()
    .optional()
    .describe('The primary goal of this promotion (e.g., "Increase sales", "Attract new customers", "Announce a new product").'),
  lengthPreference: z
    .enum(['short', 'medium', 'long'])
    .default('medium')
    .describe('Preferred length of the promotional text.'),
});
export type GeneratePromotionalTextInput = z.infer<typeof GeneratePromotionalTextInputSchema>;

const GeneratePromotionalTextOutputSchema = z.object({
  promotionalText: z.string().describe('The generated compelling promotional text.'),
});
export type GeneratePromotionalTextOutput = z.infer<typeof GeneratePromotionalTextOutputSchema>;

export async function generatePromotionalText(
  input: GeneratePromotionalTextInput
): Promise<GeneratePromotionalTextOutput> {
  return generatePromotionalTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePromotionalTextPrompt',
  input: {schema: GeneratePromotionalTextInputSchema},
  output: {schema: GeneratePromotionalTextOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in creating compelling promotional content for local businesses in Ethiopia.

Your goal is to generate engaging, concise, and effective promotional text based on the provided business details and promotion goals. The text should attract customers and encourage them to take action.

Business Name: {{{businessName}}}
Business Category: {{{businessCategory}}}
Product/Service Description: {{{productServiceDescription}}}
{{#if targetAudience}}
Target Audience: {{{targetAudience}}}
{{/if}}
{{#if callToAction}}
Call to Action: {{{callToAction}}}
{{/if}}
{{#if keywords.length}}
Keywords to Include: {{#each keywords}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/if}}
{{#if promotionGoal}}
Promotion Goal: {{{promotionGoal}}}
{{/if}}

Preferred Length: {{{lengthPreference}}}

Please generate the promotional text. Focus on highlighting benefits and creating a sense of urgency or desire. The output should be directly usable in a social media post or business listing.
`,
});

const generatePromotionalTextFlow = ai.defineFlow(
  {
    name: 'generatePromotionalTextFlow',
    inputSchema: GeneratePromotionalTextInputSchema,
    outputSchema: GeneratePromotionalTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
