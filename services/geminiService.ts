import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Offer } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Internal type for the first step of generation
interface TextOffer {
  title: string;
  body: string;
  imagePrompt: string;
}

const textOfferSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A short, catchy title or headline for the promotional post."
    },
    body: {
      type: Type.STRING,
      description: "The full text of the social media post, including emojis and calls to action."
    },
    imagePrompt: {
        type: Type.STRING,
        description: "A detailed, descriptive prompt for an AI image generator to create a visually appealing and relevant image for this post. This should be a photorealistic description."
    }
  },
  required: ['title', 'body', 'imagePrompt'],
};

export const generateOffers = async (
  businessName: string,
  businessType: string,
  occasion: string,
  keywords: string,
  postLength: string,
  keywordRichness: number,
  location: string,
): Promise<Offer[]> => {

  let richnessDescription;
  if (keywordRichness <= 3) {
    richnessDescription = 'minimal and subtle';
  } else if (keywordRichness <= 7) {
    richnessDescription = 'balanced and natural';
  } else {
    richnessDescription = 'high-density and prominent';
  }

  const textPrompt = `
    You are a creative social media marketing expert and SEO specialist for Google Business Profiles.
    Your task is to generate 3 compelling and distinct promotional post offers for a business.
    You must also generate a detailed image prompt for an AI image generator for each offer.

    Business Details:
    - Name: ${businessName || 'Not provided'}
    - Type: ${businessType}
    - Location: ${location || 'Not provided'}
    - Occasion: ${occasion === 'Automatic' ? 'Please generate a creative and relevant occasion (e.g., based on season, a fun holiday, or a general theme like "Mid-Week Treat").' : occasion}
    - User Keywords: ${keywords}

    Post Requirements:
    - Length: Create a post that is '${postLength}' in length.
    - Keyword Strategy: I want a ${richnessDescription} use of keywords.
      First, analyze the user's keywords (${keywords}). Then, find related, high-ranking keywords that would be good for a '${businessType}' ${businessName ? `called '${businessName}'` : ''} ${location ? `in '${location}'` : ''} on Google Business Profile for the specified occasion.
      Integrate both the user's keywords and the new SEO keywords naturally into the post body. If a business name or location is provided, cleverly include it in the post.
    - Tone: Exciting, appealing, and professional. Use relevant emojis.

    Generate 3 distinct and creative post offers. For each offer, provide:
    1. A catchy title.
    2. The full post body.
    3. A detailed, photorealistic prompt for an AI image generator that captures the essence of the offer. The prompt should describe a vibrant and professional-looking image.
  `;

  try {
    // Step 1: Generate text content and image prompts
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: textPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            offers: {
              type: Type.ARRAY,
              description: "A list of 3 generated promotional offers with text and image prompts.",
              items: textOfferSchema,
            },
          },
          required: ['offers'],
        },
      },
    });

    const responseText = textResponse.text.trim();
    const parsedJson = JSON.parse(responseText);
    const textOffers: TextOffer[] = parsedJson.offers;

    if (!textOffers || textOffers.length === 0) {
        throw new Error("AI failed to generate offer ideas.");
    }
    
    // Step 2: Generate an image for each text offer
    const fullOffers = await Promise.all(
      textOffers.map(async (offer) => {
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: offer.imagePrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        let imageUrl = '';
        for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            }
        }

        if (!imageUrl) {
            console.warn(`Failed to generate image for prompt: ${offer.imagePrompt}`);
        }
        
        return {
            id: crypto.randomUUID(),
            title: offer.title,
            body: offer.body,
            imageUrl: imageUrl,
        };
      })
    );
    
    return fullOffers;

  } catch (error) {
    console.error("Error in generateOffers service:", error);
    throw new Error("An error occurred while communicating with the AI service.");
  }
};