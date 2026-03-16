'use client';

import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { FabricAnalysis } from './types';

export type AIModel = 'gemini' | 'deepseek';

const fabricAnalysisSchema = z.object({
  length: z.number(),
  width: z.number(),
  height: z.number(),
  wastagePercent: z.number(),
  gauzaNeeded: z.number(),
  accessories: z.object({
    hasChains: z.boolean(),
    chainLength: z.number().optional(),
    buckleCount: z.number(),
    dLockCount: z.number(),
    hasGum: z.boolean(),
    gumLength: z.number().optional(),
  }),
  sewingComplexity: z.enum(['simple', 'medium', 'complex']),
});

export async function analyzeWithGemini(imageData: string): Promise<FabricAnalysis> {

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      'Gemini API key not found. Please set GOOGLE_GENERATIVE_AI_API_KEY in .env.local'
    );
  }

  const prompt = `
You are a manufacturing cost estimation expert.

Analyze the product image and estimate:

1. length (inches)
2. width (inches)
3. height (inches)
4. wastagePercent (10-30%)
5. gauzaNeeded (1 gauza = 36 inches in Nepal)

Accessories:
- chains
- buckles
- dLocks
- gum

Return ONLY JSON with this format.
`;

  const base64Data = imageData.split(',')[1] || imageData;

  // convert base64 -> Uint8Array
  const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

  const { text } = await generateText({
    model: google('gemini-2.0-flash'),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image',
            image: imageBytes,
          },
        ],
      },
    ],
  });

  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Could not parse AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const validated = fabricAnalysisSchema.parse(parsed);

  return {
    ...validated,
    gauzaNeeded: Math.ceil(validated.gauzaNeeded * 100) / 100,
    wastagePercent: Math.round(validated.wastagePercent),
  };
}

export async function analyzeWithDeepSeek(): Promise<FabricAnalysis> {
  throw new Error('DeepSeek vision is not yet supported. Please use Gemini.');
}

export async function analyzeImage(
  imageData: string,
  model: AIModel = 'gemini'
): Promise<FabricAnalysis> {

  if (model === 'deepseek') {
    return analyzeWithDeepSeek();
  }

  return analyzeWithGemini(imageData);
}