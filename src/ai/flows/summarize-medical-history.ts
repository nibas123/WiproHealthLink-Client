'use server';
/**
 * @fileOverview Summarizes a user's medical history for emergency alerts.
 *
 * - summarizeMedicalHistory - A function that summarizes medical history.
 * - SummarizeMedicalHistoryInput - The input type for the summarizeMedicalHistory function.
 * - SummarizeMedicalHistoryOutput - The return type for the summarizeMedicalHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMedicalHistoryInputSchema = z.object({
  medicalHistory: z.string().describe('The complete medical history of the employee.'),
  currentLocation: z.string().describe('The current location of the employee.'),
});
export type SummarizeMedicalHistoryInput = z.infer<typeof SummarizeMedicalHistoryInputSchema>;

const SummarizeMedicalHistoryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the employee medical history and current location for emergency response.'),
});
export type SummarizeMedicalHistoryOutput = z.infer<typeof SummarizeMedicalHistoryOutputSchema>;

export async function summarizeMedicalHistory(input: SummarizeMedicalHistoryInput): Promise<SummarizeMedicalHistoryOutput> {
  return summarizeMedicalHistoryFlow(input);
}

const summarizeMedicalHistoryPrompt = ai.definePrompt({
  name: 'summarizeMedicalHistoryPrompt',
  input: {schema: SummarizeMedicalHistoryInputSchema},
  output: {schema: SummarizeMedicalHistoryOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing an employee's medical history and current location for emergency response.  Provide a concise summary, highlighting critical information such as allergies, medications, and any pre-existing conditions.  Include the employee's current location in the summary.\n\nMedical History: {{{medicalHistory}}}\nCurrent Location: {{{currentLocation}}}`,
});

const summarizeMedicalHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeMedicalHistoryFlow',
    inputSchema: SummarizeMedicalHistoryInputSchema,
    outputSchema: SummarizeMedicalHistoryOutputSchema,
  },
  async input => {
    const {output} = await summarizeMedicalHistoryPrompt(input);
    return output!;
  }
);
