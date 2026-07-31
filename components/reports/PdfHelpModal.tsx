import React from "react";

// ============================================================
// PDF 저장 안내 모달 컴포넌트
// ============================================================

interface PdfHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

export default function PdfHelpModal({ isOpen, onClose, onPrint }: PdfHelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
            <span>📄 PDF 저장 안내</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            ✕
          </button>
        </div>

        <div className="space-y-2 text-gray-700 leading-relaxed">
          <p className="font-semibold text-gray-900">
            [보고서 PDF 파일 저장 방법]
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>아래 <strong>「인쇄 창 열기」</strong> 버튼을 클릭합니다.</li>
            <li>브라우저 인쇄 설정 창의 대상(프린터)에서 <strong>「PDF로 저장」</strong>을 선택합니다.</li>
            <li>여백 및 배경 그래픽 옵션을 확인한 후 <strong>「저장」</strong>을 누릅니다.</li>
          </ol>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-blue-800">
          💡 인쇄 시 네비게이션 메뉴 및 상단 사이드바는 자동으로 숨김 처리되어 보고서 내용만 깔끔하게 PDF로 저장됩니다.
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-3 py-2 font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            닫기
          </button>
          <button
            onClick={() => {
              onClose();
              onPrint();
            }}
            className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            인쇄 창 열기 ↗
          </button>
        </div>
      </div>
    </div>
  );
}
