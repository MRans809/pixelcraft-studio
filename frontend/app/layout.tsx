import type { Metadata } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { TaskProvider } from "@/components/TaskProvider";

export const metadata: Metadata = {
  title: "PixelCraft | 素材制作工作台",
  description: "上传图片，创建可跟踪的模拟素材制作任务。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <TaskProvider><AppShell>{children}</AppShell></TaskProvider>
      </body>
    </html>
  );
}

