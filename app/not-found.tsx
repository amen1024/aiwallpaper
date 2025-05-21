/**
 * 全局 404 页面
 * 需显式声明 edge runtime
 */
export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl">404 - 页面未找到</h1>
    </div>
  );
}