import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates an image from a text prompt using the Gemini API.
 * @param prompt The text prompt describing the desired image.
 * @returns A promise that resolves to the Base64 encoded image string.
 */
export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Genera una escena de fondo fotorrealista para una foto de producto. La escena debe ser: ${prompt}. No incluyas ningún producto en la imagen, solo el fondo.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return base64ImageBytes;
        } else {
            throw new Error("La API no generó ninguna imagen.");
        }
    } catch (error) {
        console.error("Error generating image with Gemini:", error);
        throw new Error("Error al generar la imagen. Es posible que el modelo haya rechazado el prompt.");
    }
};