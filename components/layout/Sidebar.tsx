"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/constants/navigation";
import type { NavItem } from "@/types";
import { useAdmin } from "@/context/AdminContext";

// ============================================================
// 왼쪽 고정 사이드바 컴포넌트
// ============================================================

interface SidebarNavItemProps {
  item: NavItem;
  isActive: boolean;
}

function SidebarNavItem({ item, isActive }: SidebarNavItemProps) {
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
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { canAccessModule } = useAdmin();
  const visibleItems = NAV_ITEMS.filter((item) => canAccessModule(item.module));

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-60 flex flex-col bg-[#1e2a4a] border-r border-slate-700">
      {/* 로고 영역 */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm leading-tight truncate">
            이타쿠라 제빵
          </p>
          <p className="text-slate-400 text-xs leading-tight truncate">
            통합관리 시스템
          </p>
        </div>
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

      {/* 버전 정보 */}
      <div className="px-5 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">v1.0.0 — 기본 뼈대</p>
      </div>
    </aside>
  );
}
