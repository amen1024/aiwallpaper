// Trae注释：OpenAI服务模块（第三方服务封装）
import OpenAI from "openai";

// Trae注释：获取OpenAI客户端实例（单例模式）
export function getOpenAIClient() {
  // Trae注释：从环境变量读取API密钥（安全配置）
  // Next.js环境变量特性：服务端变量以process.env.开头
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // 在.env.local中配置
  });

  return openai;
}
