"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { canAccessPath, currentUser } = useAdmin();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="ml-60 pt-14 min-h-screen" id="main-content">
        <div className="p-6">
          {canAccessPath(pathname) ? children : (
            <section className="mx-auto mt-20 max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-2xl">🔒</div>
              <h2 className="text-xl font-bold text-gray-900">{t("access.denied.title")}</h2>
              <p className="mt-2 text-sm text-gray-600">
                {currentUser.name} {t("access.denied.description")}
              </p>
              <Link href="/dashboard" className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                {t("access.goDashboard")}
              </Link>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
