import type { PageHeaderProps } from "@/types";

// ============================================================
// 페이지 제목 + 설명 헤더 컴포넌트
// ============================================================

export default function PageHeader({ title, description, breadcrumb }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* 브레드크럼 (선택) */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="mb-1.5" aria-label="breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-gray-400">
            {breadcrumb.map((crumb, index) => (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <span>{crumb}</span>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* 제목 */}
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>

      {/* 설명 */}
      <p className="mt-1 text-sm text-gray-500">{description}</p>

      {/* 하단 구분선 */}
      <div className="mt-4 border-b border-gray-200" />
    </div>
  );
}
