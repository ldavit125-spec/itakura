import { redirect } from "next/navigation";

// ============================================================
// 루트 경로 → 관리자 로그인 리다이렉트
// ============================================================

export default function RootPage() {
  redirect("/admin/login");
}
