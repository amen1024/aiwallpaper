// Trae注释：用户服务模块（业务逻辑层）
import { findUserByEmail, insertUser } from "@/models/user";
import { User } from "@/types/user";

// Trae注释：用户保存逻辑（业务规则）
export async function saveUser(user: User) {
  try {
    // Trae注释：检查用户是否存在（调用模型层方法）
    const existUser = await findUserByEmail(user.email);
    
    // Trae注释：业务规则：不存在则创建新用户
    if (!existUser) {
      await insertUser(user); // 调用模型层插入数据
    }
  } catch (e) {
    // Trae注释：错误处理（日志记录）
    console.log("save user failed: ", e);
  }
}
