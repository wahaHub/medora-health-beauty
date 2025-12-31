import { GoogleGenAI, Chat } from "@google/genai";

let chatSession: Chat | null = null;

// Initialize the Gemini client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

export const initializeChat = async () => {
  try {
    const ai = getAiClient();
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `
          你是一个高端整形医院（艺美整形中心）的智能咨询顾问。
          你的语气应该是专业、温暖、富有同理心且让人安心的。
          
          请遵循以下原则：
          1. 简要回答用户关于整形手术（如隆鼻、双眼皮、隆胸、吸脂等）、术后恢复、皮肤管理的问题。
          2. 强调安全性和个性化定制的重要性。
          3. 如果涉及具体的医疗诊断，请委婉地建议用户预约我们的专家进行面诊，不要直接给出医疗诊断。
          4. 我们的地址在北京市朝阳区，联系电话是 400-888-8888。
          5. 回答尽量控制在150字以内，保持简洁。
        `,
        temperature: 0.7,
      },
    });
    return true;
  } catch (error) {
    console.error("Failed to initialize chat:", error);
    return false;
  }
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    await initializeChat();
  }
  
  if (!chatSession) {
    return "抱歉，目前由于网络原因无法连接到智能顾问，请稍后再试或直接拨打我们的电话。";
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "我不太明白您的意思，能否请您重新描述一下？";
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "抱歉，系统暂时繁忙，请稍后再试。";
  }
};