import type { Metadata } from "next";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";
import { LanguageProvider } from "@/context/LanguageContext";

// ============================================================
// 루트 레이아웃
// ============================================================

export const metadata: Metadata = {
  title: {
    default: "이타쿠라 제빵 통합관리 시스템",
    template: "%s | 이타쿠라 제빵 통합관리 시스템",
  },
  description:
    "이타쿠라 제빵 공장의 자재관리, 생산관리, 품질관리, LOT 추적, 보고서를 통합하는 MES/ERP 관리 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full font-sans antialiased">
        <LanguageProvider><AdminProvider>{children}</AdminProvider></LanguageProvider>
      </body>
    </html>
  );
}
