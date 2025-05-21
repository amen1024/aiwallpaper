// Trae注释：React核心模块导入
// createContext - 创建上下文对象
// useEffect - 处理副作用（数据获取、订阅等）
// useState - 管理组件状态
import { createContext, useEffect, useState } from "react";

// Trae注释：类型定义导入（TypeScript类型校验）
// ContextProviderProps - 上下文提供者组件的props类型
// ContextProviderValue - 上下文值的类型定义
// User - 用户数据模型类型
import { ContextProviderProps, ContextProviderValue } from "@/types/context";
import { User } from "@/types/user";

// Trae注释：第三方库导入
// sonner - 轻量级通知/弹窗库
import { toast } from "sonner";

// Trae注释：创建React上下文对象
// createContext是React的API，用于创建全局状态容器
// <ContextProviderValue> 是TypeScript泛型，指定上下文值类型
// {} as ContextProviderValue 是类型断言，初始化空对象避免类型错误
export const AppContext = createContext({} as ContextProviderValue);

// Trae注释：上下文提供者组件（Context Provider）
// 这是React Context模式的核心组件，用于包裹需要访问上下文的子组件
// ContextProviderProps 定义了组件的props类型
// ({ children }) 是解构赋值，接收子组件（类似Vue的slot）
export const AppContextProvider = ({ children }: ContextProviderProps) => {
  // Trae注释：用户状态管理（React useState Hook）
  // useState 是React的状态管理Hook，返回[状态值, 更新函数]数组
  // User | null | undefined 表示三种可能状态：
  // - undefined: 初始化状态（尚未获取用户信息）
  // - null: 已获取信息但用户未登录
  // - User对象: 已登录用户数据
  const [user, setUser] = useState<User | null | undefined>(undefined);

  // Trae注释：异步获取用户信息函数
  // async/await 是ES7的异步处理语法，替代Promise链式调用
  // 使用try/catch处理异步操作中的错误
  const fetchUserInfo = async function () {
    try {
      const uri = "/api/get-user-info"; // Next.js API路由地址
      const params = {}; // 请求参数对象

      // Trae注释：使用浏览器原生Fetch API发送请求
      // await 会暂停代码执行，直到Promise完成
      // method: "POST" 指定HTTP方法
      // body: JSON.stringify(params) 将对象序列化为JSON字符串
      const resp = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params),
      });

      // Trae注释：处理HTTP响应
      // resp.ok 表示HTTP状态码在200-299范围内
      if (resp.ok) {
        const res = await resp.json(); // 解析JSON响应体
        if (res.data) {
          setUser(res.data); // 更新用户状态（触发组件重新渲染）
          return;
        }
      }

      setUser(null); // 清空用户状态（未登录状态）
    } catch (e) {
      setUser(null); // 异常时清空用户状态

      // Trae注释：错误处理
      console.log("get user info failed: ", e); // 控制台输出错误日志
      toast.error("get user info failed"); // 显示用户友好的错误提示
    }
  };

  // Trae注释：React生命周期钩子（useEffect Hook）
  // useEffect用于处理副作用（数据获取、DOM操作等）
  // 空依赖数组[]表示只在组件挂载时执行一次（类似类组件的componentDidMount）
  useEffect(() => {
    fetchUserInfo(); // 组件加载时自动获取用户信息
  }, []); // 依赖数组（空表示无依赖，只执行一次）

  // Trae注释：上下文提供者的渲染逻辑
  return (
    // AppContext.Provider 将上下文值传递给子组件
    // value 属性包含要传递的状态和方法
    // { user, fetchUserInfo } 是上下文值的简写形式，等价于：
    // { user: user, fetchUserInfo: fetchUserInfo }
    <AppContext.Provider value={{ user, fetchUserInfo }}>
      {children} {/* 渲染所有子组件 */}
    </AppContext.Provider>
  );
};
