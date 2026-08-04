"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ITEMS } from "@/constants/navigation";
import type { NavItem } from "@/types";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// 왼쪽 고정 사이드바 컴포넌트
// ============================================================

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
}

function SidebarNavItem({ item, isActive }: SidebarNavItemProps) {
  const { t } = useLanguage();
  return (
    <li>
      <Link
        href={item.href}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium
          transition-colors duration-150
          ${
            isActive
              ? "bg-blue-600 text-white"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }
        `}
      >
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.75}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d={item.icon}
          />
        </svg>
        <span className="truncate">{t(item.label)}</span>
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const { canAccessModule, logoutAdmin } = useAdmin();
  const visibleItems = NAV_ITEMS.filter((item) => canAccessModule(item.module));

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-60 flex flex-col bg-[#1e2a4a] border-r border-slate-700">
      {/* 로고 영역 */}
      <div className="flex items-center justify-center px-4 py-4 border-b border-slate-700 bg-amber-50/10">
        <Image
          src="/logo.png"
          alt="이타쿠라 베이커리 (ITAKURA BAKERY)"
          width={180}
          height={60}
          className="h-12 w-auto object-contain rounded-md p-1 bg-amber-50/90 shadow-sm"
          priority
        />
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {visibleItems.map((item) => (
            <SidebarNavItem
              key={item.href}
              item={item}
              isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            />
          ))}
        </ul>
      </nav>

      {/* 하단 버전 정보 및 로그아웃 버튼 */}
      <div className="px-5 py-4 border-t border-slate-700 flex items-center justify-between">
        <p className="text-slate-500 text-xs">v1.0.0</p>
        <button
          type="button"
          onClick={() => {
            logoutAdmin();
            router.replace("/admin/login");
          }}
          className="text-slate-400 hover:text-white text-xs flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {t("action.logout")}
        </button>
      </div>
    </aside>
  );
}
