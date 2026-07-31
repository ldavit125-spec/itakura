import type { EmptyCardData } from "@/types";

// ============================================================
// 빈 기능 카드 — 미구현 섹션 플레이스홀더
// ============================================================

interface EmptyCardProps {
  data: EmptyCardData;
}

export default function EmptyCard({ data }: EmptyCardProps) {
  return (
    <div
      className="bg-white rounded-lg border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center min-h-[160px]"
      id={`empty-card-${data.id}`}
    >
      {/* 아이콘 */}
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>

      {/* 제목 */}
      <h3 className="text-sm font-semibold text-gray-600 mb-1">{data.title}</h3>

      {/* 설명 */}
      <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">
        {data.description}
      </p>

      {/* 뱃지 */}
      <span className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        개발 예정
      </span>
    </div>
  );
}
