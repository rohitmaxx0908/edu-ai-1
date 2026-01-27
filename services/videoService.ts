
import { GoogleGenAI } from "@google/genai";

export const generateConceptVideo = async (
  topic: string, 
  onProgress: (msg: string) => void,
  image?: { data: string, mimeType: string },
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  // 1. Check for API key selection
  if (!(await (window as any).aistudio.hasSelectedApiKey())) {
    await (window as any).aistudio.openSelectKey();
    // Proceed assuming success as per race condition guidelines
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  onProgress("Initializing Visual Engine...");
  
  try {
    const videoRequest: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A high-quality educational visualization of: ${topic}. Cinematic style, clear concepts, futuristic academic aesthetic.`,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    };

    if (image) {
      videoRequest.image = {
        imageBytes: image.data,
        mimeType: image.mimeType
      };
    }

    let operation = await ai.models.generateVideos(videoRequest);

    const statusMessages = [
      "Gathering conceptual assets...",
      "Grounding visual logic...",
      "Synthesizing high-fidelity frames...",
      "Finalizing cinematic projection...",
      "Optimizing bitstream for delivery..."
    ];
    let msgIndex = 0;

    while (!operation.done) {
      onProgress(statusMessages[msgIndex % statusMessages.length]);
      msgIndex++;
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Re-instantiate to ensure latest key is used if it was changed
      const pollingAi = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      operation = await pollingAi.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation yielded no results.");

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    if (error?.message?.includes("Requested entity was not found")) {
      await (window as any).aistudio.openSelectKey();
      throw new Error("API Key sync required. Please try again.");
    }
    throw error;
  }
};
