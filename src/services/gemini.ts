import { GoogleGenAI } from "@google/genai";
import { UrbanParams, ImpactMetrics } from "../types";
import { TEAM_DATA } from "../data/teams";

// Helper to get the AI instance with the latest key
function getAI() {
  // Prefer API_KEY if available (from paid selection), otherwise fallback to GEMINI_API_KEY
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please connect your Google Cloud Project.");
  }
  return new GoogleGenAI({ apiKey });
}

function buildTeamContext(params: UrbanParams): string {
  const selectedTeams = params.teams || [];
  return selectedTeams.map(teamId => {
    const team = TEAM_DATA.find(t => t.id === teamId);
    if (!team) return '';
    const selectedFeatures = params.teamFeatures?.[teamId] || team.features.map(f => f.id);
    const featureLabels = team.features.filter(f => selectedFeatures.includes(f.id)).map(f => f.label);
    if (featureLabels.length > 0) {
      return `${team.label}: ${team.description} (Selected features: ${featureLabels.join(', ')})`;
    }
    return `${team.label}: ${team.description}`;
  }).filter(Boolean).join('\n    - ');
}

export async function generateUrbanImage(params: UrbanParams): Promise<string> {
  const ai = getAI();
  
  const selectedTeams = params.teams || [];
  const teamContext = buildTeamContext(params);

  const prompt = `
    A photorealistic architectural visualization of a futuristic urban business park, reimagined for 2040.
    
    CRITICAL VISUAL CONSTRAINTS:
    - MUST look like a modern business park: Low-to-mid-rise high-tech campus buildings (8-10 stories), modern glass/steel facades, wide landscaped pedestrian boulevards.
    - DO NOT show: Iconic recognizable city landmarks. Keep it generic.
    - Context: Near a major transit hub, flat terrain, tropical lush greenery.
    
    Planning Context (Inspired by: ${selectedTeams.join(', ')}):
    - Strategic Focus: ${params.focus}
    
    Selected Team Inspirations:
    - ${teamContext}

    The scene should be vibrant, futuristic yet realistic, sunny day, 8k resolution, architectural render.
    Blend the key visual elements of the selected teams into a cohesive district design.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "1K"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error; // Re-throw to handle in UI
  }
}

export async function generateImpactAnalysis(params: UrbanParams): Promise<{ text: string; metrics: ImpactMetrics; explanation: { theme: string; features: string[] } }> {
  const ai = getAI();
  
  const selectedTeams = params.teams || [];
  const teamContext = buildTeamContext(params);

  const prompt = `
    Act as a strategic urban planner evaluating proposals from ${selectedTeams.join(', ')}. Analyze the following "Urban 2040" configuration:
    ${JSON.stringify(params)}

    Context:
    - Vision: "Global Innovation Capital" & "Physical AI Oasis".
    - Location: A major urban business district.
    
    Selected Team Visions:
    - ${teamContext}

    Provide a JSON response with:
    1. "metrics": Object with integer scores (0-100) for: 'economic' (Innovation Output), 'social' (Livability/Vibrancy), 'environmental' (Resilience), 'feasibility' (Implementation), and 'innovation' (Tech Sovereignty).
    2. "analysis": A concise paragraph (max 150 words) evaluating how well this configuration achieves the "District Flywheel" effect. You MUST explicitly reference and link the evaluation to the user's Strategic Focus: "${params.focus}".
    3. "theme": A short, catchy title/theme for this specific simulation (e.g., "The Biophilic Innovation Loop").
    4. "features": An array of 3-4 key bullet points highlighting the specific features of this simulation based on the parameters and teams.
    
    Return ONLY valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    return {
      text: data.analysis || "Analysis unavailable.",
      metrics: data.metrics || { economic: 50, social: 50, environmental: 50, feasibility: 50, innovation: 50 },
      explanation: {
        theme: data.theme || "Urban 2040 Simulation",
        features: data.features || ["Integrated District", "Sustainable Future", "Innovation Hub"]
      }
    };
  } catch (error) {
    console.error("Analysis generation failed:", error);
    return {
      text: "Failed to generate analysis. Please try again.",
      metrics: { economic: 0, social: 0, environmental: 0, feasibility: 0, innovation: 0 },
      explanation: {
        theme: "Simulation Error",
        features: ["Unable to generate features"]
      }
    };
  }
}

export async function generateFlythroughVideo(params: UrbanParams, startImageUrl?: string): Promise<string> {
   const ai = getAI();
   
   const selectedTeams = params.teams || [];
   const teamContext = buildTeamContext(params);
   
   const prompt = `
    Cinematic drone flythrough of a futuristic urban business park 2040.
    
    CRITICAL VISUAL CONSTRAINTS:
    - MUST look like a modern business park: Low-to-mid-rise high-tech campus buildings (8-10 stories), modern glass/steel facades, wide landscaped pedestrian boulevards.
    - Architecture: Campus-style business park, low-rise clusters, extensive glass facades with sun-shading fins, tropical landscaping.
    - DO NOT show: Iconic recognizable city landmarks.
    - NO iconic real-world skyline elements. This is a specific business park district, not the city center.
    - Context: Near a major transit hub, flat terrain, tropical lush greenery.

    Perspective: Inspired by ${teamContext}.
    Features: ${params.focus} district.
    Vibe: "Humans-First Living District", vibrant, sunny, futuristic, 4k.
  `;

  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const videoPayload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p', 
          aspectRatio: '16:9'
        }
      };

      // Use the generated image as a starting frame for consistency
      if (startImageUrl && startImageUrl.startsWith('data:')) {
        const [mimePart, dataPart] = startImageUrl.split(',');
        const mimeType = mimePart.split(':')[1].split(';')[0];
        videoPayload.image = {
          imageBytes: dataPart,
          mimeType: mimeType
        };
      }

      let operation = await ai.models.generateVideos(videoPayload);

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!videoUri) throw new Error("No video URI returned from API");

      return videoUri;

    } catch (error: any) {
      const isLastAttempt = attempt + 1 >= maxRetries;
      
      // Check if it's a 503 or 429 (Too Many Requests) or other transient error
      const errorCode = error.code || error.error?.code || error.status;
      const errorMessage = error.message || error.error?.message || JSON.stringify(error);
      
      const isQuotaError = 
        errorCode === 429 || 
        errorCode === 'RESOURCE_EXHAUSTED' ||
        errorMessage.includes('429') || 
        errorMessage.includes('quota') ||
        errorMessage.includes('RESOURCE_EXHAUSTED');

      const isTransient = 
        errorCode === 503 || 
        errorCode === 'UNAVAILABLE' ||
        isQuotaError;

      if (isTransient && !isLastAttempt) {
        attempt++;
        // Exponential backoff: 5s, 10s, 20s...
        const delay = Math.pow(2, attempt) * 2500; 
        console.warn(`Video generation attempt ${attempt} failed (transient). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error("Video generation failed:", error);
      
      if (isQuotaError) {
        throw new Error("Video generation quota exceeded. Please check your Google Cloud billing or try again later.");
      }
      
      throw error;
    }
  }
  throw new Error("Video generation failed after multiple attempts.");
}
