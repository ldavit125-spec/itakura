"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { NAV_ITEMS } from "@/constants/navigation";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";

function getCurrentPageLabel(pathname: string): string {
  return NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? "header.page";
}

const ROLE_KEYS: Record<string, string> = {
  ADMIN: "role.systemAdmin", MATERIAL_MANAGER: "role.materialAdmin", PRODUCTION_MANAGER: "role.productionAdmin", QUALITY_MANAGER: "role.qualityAdmin", WORKER: "role.worker",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, users, roles, switchDemoUser, isAdminAuthenticated, logoutAdmin } = useAdmin();
  const { language, setLanguage, t } = useLanguage();
  const roleLabel = roles
    .filter((role) => currentUser.roleIds.includes(role.id))
    .map((role) => t(ROLE_KEYS[role.code] ?? ""))
    .join(", ");

  return (
    <header className="fixed top-0 left-60 right-0 z-20 h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-gray-800 truncate">{t(getCurrentPageLabel(pathname))}</h1>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <label className="hidden md:flex items-center gap-2 text-xs text-gray-500">
          {t("header.demoUser")}
          <select
            value={currentUser.id}
            onChange={(event) => switchDemoUser(event.target.value)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700"
            aria-label={t("header.demoUserSwitch")}
          >
            {users.filter((user) => user.status === "ACTIVE").map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </label>
        <div className="w-px h-6 bg-gray-200" aria-hidden="true" />
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value as "ko" | "ja")}
          className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 font-medium"
          aria-label="Language Selector"
        >
          <option value="ko">한국어</option>
          <option value="ja">日本語</option>
        </select>
        <div className="w-px h-6 bg-gray-200" aria-hidden="true" />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
            {currentUser.name.slice(0, 1)}
          </div>
          <div className="hidden sm:block max-w-52">
            <p className="text-sm font-medium text-gray-800 leading-tight">{currentUser.name}</p>
            <p className="text-xs text-gray-500 leading-tight truncate">{roleLabel}</p>
          </div>
        </div>
        {isAdminAuthenticated ? (
          <button type="button" onClick={() => { logoutAdmin(); router.replace("/admin/login"); }}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors">
            {t("action.logout")}
          </button>
        ) : (
          <Link href="/admin/login" className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100">
            {t("header.adminLogin")}
          </Link>
        )}
      </div>
    </header>
  );
}
