"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value?: string;
  className?: string;
  placeholderText?: string;
}

export default function DateInput({
  value,
  onChange,
  className = "",
  placeholderText,
  ...props
}: DateInputProps) {
  const { language } = useLanguage();

  const defaultPlaceholder = language === "ja" ? "年 - 月 - 日" : "연도-월-일";
  const displayPlaceholder = placeholderText || defaultPlaceholder;

  return (
    <div className="relative inline-flex items-center w-full">
      <input
        type="date"
        value={value ?? ""}
        onChange={onChange}
        className={className}
        {...props}
      />
      {!value && (
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-white pr-8 select-none"
          aria-hidden="true"
        >
          {displayPlaceholder}
        </span>
      )}
    </div>
  );
}
