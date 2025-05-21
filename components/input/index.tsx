// Trae注释：必须的客户端组件声明，Next.js 13+ App Router的特性
// 表示该组件需要在客户端执行（包含交互逻辑或浏览器API）
"use client";

// Trae注释：导入React核心模块
// - Dispatch 和 SetStateAction 用于类型安全的React状态管理
// - KeyboardEvent 处理键盘事件
// - useContext 用于访问React上下文
// - useEffect 处理副作用
// - useRef 获取DOM引用
// - useState 管理组件状态
import {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

// Trae注释：导入应用上下文（全局状态管理）
import { AppContext } from "@/contexts/AppContext";

// Trae注释：导入shadcn/ui组件库的按钮和输入组件
// 这是经过封装的可复用UI组件
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Trae注释：导入类型定义（TypeScript类型校验）
import { Wallpaper } from "@/types/wallpaper";

// Trae注释：导入第三方库
// - sonner：用于显示Toast通知
// - next/navigation：Next.js 13+ 路由导航库
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Trae注释：定义组件Props接口
// 这是TypeScript的接口声明，规范组件接收的属性类型
interface Props {
  wallpapers: Wallpaper[];          // 当前壁纸列表数据
  setWallpapers: Dispatch<SetStateAction<Wallpaper[]>>; // 更新壁纸列表的方法
}

// Trae注释：函数式组件，使用解构语法接收props
export default function ({ setWallpapers }: Props) {
  // Trae注释：使用React上下文获取全局用户状态
  // useContext是React Hooks API，用于访问上下文值
  const { user, fetchUserInfo } = useContext(AppContext);

  // Trae注释：使用React Hooks管理组件状态
  // useState返回状态值和更新函数，使用泛型定义状态类型
  const [description, setDescription] = useState("");      // 输入框内容
  const [loading, setLoading] = useState(false);           // 加载状态
  const inputRef = useRef<HTMLInputElement | null>(null);  // DOM引用（访问输入框元素）
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null); // 当前生成的壁纸
  
  // Trae注释：使用Next.js路由钩子
  // 用于页面导航（编程式路由跳转）
  const router = useRouter();

  // Trae注释：异步请求函数（生成壁纸）
  // async/await 处理异步操作，try/catch 捕获异常
  const requestGenWallpaper = async function () {
    try {
      const uri = "/api/protected/gen-wallpaper"; // API路由地址
      const params = { description: description }; // 请求参数

      // 开始加载状态
      setLoading(true);
      
      // Trae注释：使用Fetch API发送POST请求
      // - method: 指定HTTP方法
      // - body: 请求体需要序列化成JSON字符串
      const resp = await fetch(uri, {
        method: "POST",
        body: JSON.stringify(params),
      });
      
      // 结束加载状态
      setLoading(false);

      // Trae注释：处理401未授权状态
      // HTTP状态码401表示用户未认证
      if (resp.status === 401) {
        toast.error("Please Sign In");
        router.push("/sign-in"); // 跳转到登录页
        return;
      }

      // Trae注释：处理成功响应（HTTP 200-299状态码）
      if (resp.ok) {
        // 解析JSON格式的响应体
        const { code, message, data } = await resp.json();
        
        // 处理业务逻辑错误（非HTTP错误）
        if (code !== 0) {
          toast.error(message);
          return;
        }
        
        // 处理有效数据
        if (data && data.img_url) {
          // 更新用户信息（如剩余积分）
          fetchUserInfo();

          // 清空输入框内容
          setDescription("");

          // Trae注释：更新壁纸列表
          // 使用函数式更新保证获取最新状态
          setWallpapers((wallpapers: Wallpaper[]) => [
            data,       // 新增壁纸（插入数组开头）
            ...wallpapers, // 展开已有壁纸    展开运算符 ...  这是ES6的数组展开语法，相当于将原数组中的所有元素解构到新数组中。
          ]);

          toast.success("gen wallpaper ok"); // 成功提示
          return;
        }
      }

      // 处理其他错误情况
      toast.error("gen wallpaper failed");
    } catch (e) {
      console.log("search failed: ", e);
      toast.error("gen wallpaper failed");
    }
  };

  // Trae注释：处理键盘输入事件
  // 当按下Enter键时提交表单（排除Shift+Enter和中文输入法确认）
  const handleInputKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter" && !e.shiftKey) {
      // 229是中文输入法确认键的keyCode
      if (e.keyCode !== 229) {
        e.preventDefault(); // 阻止默认换行行为
        handleSubmit();
      }
    }
  };

  // Trae注释：表单提交处理逻辑
  const handleSubmit = function () {
    // 校验输入内容
    if (!description) {
      toast.error("invalid image description");
      inputRef.current?.focus(); // 聚焦到输入框
      return;
    }

    // 校验用户登录状态
    if (!user) {
      toast.error("please sign in");
      return;
    }

    // 校验用户积分
    if (user.credits && user.credits.left_credits < 1) {
      toast.error("credits not enough");
      return;
    }

    // 发起生成请求
    requestGenWallpaper();
  };

  // Trae注释：副作用钩子（组件挂载时执行）
  // 空依赖数组表示只执行一次（类似类组件的componentDidMount）
  useEffect(() => {
    inputRef.current?.focus(); // 自动聚焦到输入框
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Trae注释：表单元素（Tailwind CSS布局） */}
      <form
        className="flex w-full flex-col gap-3 sm:flex-row"
        // 阻止表单默认提交行为（使用自定义提交逻辑）
        onSubmit={(e) => e.preventDefault()}
      >
        {/* 输入框组件 */}
        <Input
          type="text"
          placeholder="Wallpaper description"
          value={description}
          onChange={(e) => setDescription(e.target.value)} // 受控组件绑定
          onKeyDown={handleInputKeydown} // 键盘事件监听
          disabled={loading} // 禁用状态
          ref={inputRef} // DOM引用绑定
        />

        {/* 提交按钮 */}
        <Button 
          type="button" 
          disabled={loading} 
          onClick={handleSubmit}
        >
          {/* 根据加载状态显示不同文本 */}
          {loading ? "Generating..." : "Generate"}
        </Button>
      </form>
    </div>
  );
}
