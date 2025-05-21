// Trae注释：客户端组件标识（Next.js 13+ App Router特性）
"use client";
export const runtime = "edge";

// Trae注释：React核心模块导入
// useContext - 访问React上下文
// useEffect - 处理副作用（数据获取）
// useState - 管理组件状态
import { useContext, useEffect, useState } from "react";

// Trae注释：项目组件导入（基于路径别名@/）
import Hero from "@/components/hero";        // 顶部横幅组件
import Input from "@/components/input";      // 输入生成组件
import Producthunt from "@/components/producthunt"; // 产品推广组件
import Wallpapers from "@/components/wallpapers";  // 壁纸展示组件

// Trae注释：类型定义和工具库导入
import { Wallpaper } from "@/types/wallpaper"; // TypeScript类型定义
import { toast } from "sonner";              // 轻量级通知库
import { AppContext } from "@/contexts/AppContext"; // 全局上下文

// Trae注释：默认导出的页面组件（Next.js页面规范）
export default function () {
  // Trae注释：使用上下文获取全局用户状态
  // useContext是React Hook，用于访问最近的Context Provider值
  const { user } = useContext(AppContext);

  // Trae注释：使用useState管理组件状态
  // [wallpapers, setWallpapers] 是壁纸数据的状态及更新方法
  // <Wallpaper[]> 泛型参数指定数组元素类型
  // [] 初始值为空数组
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  
  // Trae注释：加载状态管理
  // false 表示初始未加载状态
  const [loading, setLoading] = useState(false);

  // Trae注释：异步获取壁纸数据函数
  // async/await 处理异步操作，参数page表示分页页码
  const fetchWallpapers = async function (page: number) {
    try {
      const uri = "/api/get-wallpapers"; // Next.js API路由地址
      const params = {
        page: page,     // 当前页码
        limit: 50,     // 每页数据量
      };

      setLoading(true); // 开始加载状态（显示加载指示器）
      
      // Trae注释：使用Fetch API发送POST请求
      // Next.js的API路由位于app/api目录下
      const resp = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params), // 序列化请求参数
      });
      setLoading(false); // 结束加载状态

      // Trae注释：处理HTTP响应
      if (resp.ok) {
        const res = await resp.json(); // 解析JSON格式响应
        console.log("get wallpapers result: ", res); // 开发调试日志
        
        if (res.data) {
          setWallpapers(res.data); // 更新壁纸列表状态
          return;
        }
      }

      toast.error("get wallpapers failed"); // 错误提示
    } catch (e) {
      console.log("get wallpapers failed: ", e); // 错误日志
      toast.error("get wallpapers failed");
    }
  };

  // Trae注释：React生命周期钩子
  // useEffect在组件挂载时执行（空依赖数组[]）
  // 相当于类组件的componentDidMount
  useEffect(() => {
    fetchWallpapers(1); // 初始化加载第一页数据
  }, []); // 空数组表示只执行一次

  // Trae注释：组件渲染逻辑（JSX语法）
  return (
    <div className="md:mt-16"> {/* 桌面端上边距 */}
      {/* 主要内容容器（响应式最大宽度） */}
      <div className="max-w-3xl mx-auto"> 
        <Hero /> {/* 顶部横幅组件 */}
        
        {/* 产品推广区块 */}
        <div className="my-4 md:my-6"> {/* 移动端/桌面端不同的垂直边距 */}
          <Producthunt />
        </div>

        {/* 输入区域（居中布局） */}
        <div className="mx-auto my-4 flex max-w-lg justify-center">
          {/* 输入组件（传递壁纸状态和更新方法） */}
          <Input wallpapers={wallpapers} setWallpapers={setWallpapers} />
        </div>
      </div>

      {/* 壁纸展示区域 */}
      <div className="pt-0">
        {/* 壁纸列表组件（传递数据和加载状态） */}
        <Wallpapers wallpapers={wallpapers} loading={loading} />
      </div>
    </div>
  );
}
