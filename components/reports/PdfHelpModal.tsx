import React from "react";
import { useLanguage } from "@/context/LanguageContext";

// ============================================================
// PDF 저장 안내 모달 컴포넌트
// ============================================================

interface PdfHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

export default function PdfHelpModal({ isOpen, onClose, onPrint }: PdfHelpModalProps) {
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 p-6 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
            <span>📄 {isJa ? "PDF保存ガイド" : "PDF 저장 안내"}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            ✕
          </button>
        </div>

        <div className="space-y-2 text-gray-700 leading-relaxed">
          <p className="font-semibold text-gray-900">
            {isJa ? "[レポートPDFファイル保存方法]" : "[보고서 PDF 파일 저장 방법]"}
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            {isJa ? (
              <>
                <li>下の <strong>「印刷ウィンドウを開く」</strong> ボタンをクリックします。</li>
                <li>ブラウザ印刷設定の送信先(プリンター)で <strong>「PDFとして保存」</strong> を選択します。</li>
                <li>余白および背景グラフィックオプションを確認後 <strong>「保存」</strong> を押します。</li>
              </>
            ) : (
              <>
                <li>下の<strong>「印刷画面を開く」</strong>ボタンをクリックします。</li>
                <li>ブラウザーの印刷設定で、送信先に<strong>「PDFに保存」</strong>を選択します。</li>
                <li>余白と背景グラフィックの設定を確認し、<strong>「保存」</strong>を押します。</li>
              </>
            )}
          </ol>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-blue-800">
          💡 {isJa ? "印刷時、ナビゲーションメニューおよび上部サイドバーは自動的に非表示処理され、レポート内容のみきれいにPDFとして保存されます。" : "인쇄 시 네비게이션 메뉴 및 상단 사이드바는 자동으로 숨김 처리되어 보고서 내용만 깔끔하게 PDF로 저장됩니다."}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-3 py-2 font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {isJa ? "閉じる" : "닫기"}
          </button>
          <button
            onClick={() => {
              onClose();
              onPrint();
            }}
            className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            {isJa ? "印刷ウィンドウを開く ↗" : "인쇄 창 열기 ↗"}
          </button>
        </div>
      </div>
    </div>
  );
}
