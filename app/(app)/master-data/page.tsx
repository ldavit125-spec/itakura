import type { Metadata } from "next";
import MasterDataClient from "@/components/master-data/MasterDataClient";

// ============================================================
// 기준정보 관리 페이지 — 서버 컴포넌트 (metadata 내보내기)
// ============================================================

export const metadata: Metadata = {
  title: "기준정보 관리",
};

export default function MasterDataPage() {
  return <MasterDataClient />;
}
