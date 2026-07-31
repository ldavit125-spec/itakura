import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";

// ============================================================
// 루트 레이아웃
// ============================================================

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

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
    <html lang="ko" className={`${notoSansKr.variable} h-full`}>
      <body className="h-full font-sans antialiased">
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
