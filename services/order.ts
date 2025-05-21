// Trae注释：导入模型层方法（数据持久化操作）
import { getUserOrders, updateOrderStatus } from "@/models/order";

// Trae注释：导入类型定义（TypeScript类型校验）
import { Order } from "@/types/order";
import Stripe from "stripe";
import { UserCredits } from "@/types/user";

// Trae注释：导入壁纸模型方法
import { getUserWallpapersCount } from "@/models/wallpaper";

// Trae注释：处理支付会话的业务逻辑
// Next.js服务端API特性：在服务端处理敏感操作（支付回调）
export async function handleOrderSession(session_id: string) {
  // Trae注释：初始化Stripe SDK（第三方支付网关）
  // process.env 读取环境变量（需在.env.local配置STRIPE_PRIVATE_KEY）
  const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY || "");
  
  try {
    // Trae注释：异步获取Stripe支付会话详情
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    // Trae注释：校验支付会话元数据
    if (!session || !session.metadata || !session.metadata.order_no) {
      throw new Error("invalid session");
    }

    // Trae注释：更新订单状态（调用模型层方法）
    const order_no = session.metadata.order_no;
    const paied_at = new Date().toISOString(); // ISO 8601时间格式
    await updateOrderStatus(order_no, 2, paied_at); // 2表示支付成功状态
  } catch (e) {
    // Trae注释：统一错误处理（日志记录 + 异常抛出）
    console.log("handle order session failed: ", e);
    throw e; // 向上层抛出错误（由API路由处理）
  }
}

// Trae注释：计算用户可用积分的业务逻辑
export async function getUserCredits(user_email: string): Promise<UserCredits> {
  // Trae注释：初始化积分对象（默认值演示）
  let user_credits: UserCredits = {
    one_time_credits: 1,   // 一次性积分
    monthly_credits: 2,    // 月度订阅积分
    total_credits: 3,      // 总积分
    used_credits: 0,       // 已用积分
    left_credits: 3,       // 剩余积分
  };

  try {
    // Trae注释：获取用户已生成的壁纸数量（调用模型层）
    const used_credits = await getUserWallpapersCount(user_email);
    
    // Trae注释：获取用户历史订单（模型层数据访问）
    const orders = await getUserOrders(user_email);
    if (!orders) return user_credits;

    // Trae注释：遍历订单计算积分（业务规则实现）
    orders.forEach((order: Order) => {
      if (order.plan === "monthly") {
        user_credits.monthly_credits += order.credits; // 月度订阅积分累加
      } else {
        user_credits.one_time_credits += order.credits; // 一次性积分累加
      }
      user_credits.total_credits += order.credits; // 总积分累加
    });

    // Trae注释：计算剩余可用积分
    user_credits.left_credits = user_credits.total_credits - used_credits;
    
    return user_credits;
  } catch (e) {
    // Trae注释：容错处理（返回默认积分）
    console.log("get user credits failed: ", e);
    return user_credits;
  }
}
