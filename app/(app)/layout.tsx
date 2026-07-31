import AppShell from "@/components/layout/AppShell";
import AppProviders from "@/context/AppProviders";

// ============================================================
// (app) 라우트 그룹 레이아웃 — 최상위 AppProviders 및 AppShell 공통 적용
// ============================================================

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <AppShell>{children}</AppShell>
    </AppProviders>
  );
}
