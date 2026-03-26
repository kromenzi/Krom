import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

export async function summarizeConversation(messages: any[]) {
  if (!messages.length) return "";
  
  const conversationText = messages.map(m => `${m.senderId === 'me' ? 'Buyer' : 'Supplier'}: ${m.text}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize this business conversation briefly (max 2 sentences). Focus on the key requirements or next steps discussed.\n\n${conversationText}`,
      config: {
        systemInstruction: "You are a professional business assistant for a B2B manufacturing marketplace. Provide concise, professional summaries.",
      }
    });
    return response.text || "No summary available.";
  } catch (error) {
    console.error("AI Summary Error:", error);
    return "Failed to generate summary.";
  }
}

export async function translateMessage(text: string, targetLang: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following message to ${targetLang === 'ar' ? 'Arabic' : 'English'}. Maintain the professional tone.\n\n"${text}"`,
    });
    return response.text || text;
  } catch (error) {
    console.error("AI Translation Error:", error);
    return text;
  }
}

export async function generateSuggestedReplies(messages: any[]) {
  if (!messages.length) return [];
  
  const conversationText = messages.slice(-5).map(m => `${m.senderId === 'me' ? 'Buyer' : 'Supplier'}: ${m.text}`).join('\n');
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on this conversation, suggest 3 short, professional replies for the Buyer to send next. Return only the replies as a JSON array of strings.\n\n${conversationText}`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Suggestions Error:", error);
    return [];
  }
}

export async function aiComposeMessage(prompt: string, context?: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a professional business message based on this prompt: "${prompt}". ${context ? `Context: ${context}` : ''} Keep it concise and professional.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("AI Compose Error:", error);
    return "";
  }
}

export async function getRFQRecommendations(productName: string, description: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `For an RFQ about "${productName}" with description "${description}", suggest 3-5 technical specifications or quality standards the buyer should include to get better quotes. Return as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI RFQ Recommendations Error:", error);
    return [];
  }
}
