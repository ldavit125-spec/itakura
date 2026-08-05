"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  className?: string;
  placeholderText?: string;
  name?: string;
  required?: boolean;
}

/** YYYY-MM-DD 유효성 검사 (윤년 포함) */
function isValidYYYYMMDD(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [yearStr, monthStr, dayStr] = dateStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return false;

  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

export default function DateInput({
  value = "",
  onChange,
  className = "",
  placeholderText,
  name,
  required,
  disabled,
  ...props
}: DateInputProps) {
  const { locale } = useLanguage();
  const isJa = locale === "ja";

  const [textValue, setTextValue] = useState(value);
  const [hasError, setHasError] = useState(false);
  const hiddenDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTextValue(value);
    setHasError(false);
  }, [value]);

  const commitValue = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setHasError(false);
      if (onChange) onChange({ target: { value: "", name } });
      return;
    }

    if (isValidYYYYMMDD(trimmed)) {
      setHasError(false);
      if (onChange && trimmed !== value) {
        onChange({ target: { value: trimmed, name } });
      }
    } else {
      setHasError(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    // 숫자와 하이픈만 허용
    const filteredVal = inputVal.replace(/[^0-9-]/g, "");
    setTextValue(filteredVal);
    if (hasError) setHasError(false);
  };

  const handleBlur = () => {
    commitValue(textValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitValue(textValue);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const calVal = e.target.value;
    setTextValue(calVal);
    setHasError(false);
    if (onChange) onChange({ target: { value: calVal, name } });
  };

  const openCalendar = () => {
    if (disabled) return;
    if (hiddenDateRef.current) {
      if ("showPicker" in HTMLInputElement.prototype) {
        try {
          hiddenDateRef.current.showPicker();
        } catch {
          hiddenDateRef.current.focus();
        }
      } else {
        hiddenDateRef.current.focus();
      }
    }
  };

  const borderClass = hasError
    ? "border-red-500 ring-1 ring-red-500 bg-red-50/20"
    : "";

  const combinedClass = `${className} ${borderClass}`.trim();
  const defaultPlaceholder = isJa ? "YYYY-MM-DD" : "YYYY-MM-DD";

  return (
    <div className="relative inline-flex items-center w-full">
      <input
        type="text"
        value={textValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholderText || defaultPlaceholder}
        disabled={disabled}
        required={required}
        maxLength={10}
        className={combinedClass}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={openCalendar}
        disabled={disabled}
        className="absolute right-2 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-40"
        title={isJa ? "カレンダー選択" : "달력 선택"}
      >
        📅
      </button>
      <input
        ref={hiddenDateRef}
        type="date"
        value={isValidYYYYMMDD(textValue) ? textValue : ""}
        onChange={handleCalendarChange}
        tabIndex={-1}
        className="sr-only absolute pointer-events-none opacity-0 w-0 h-0"
        aria-hidden="true"
      />
      {hasError && (
        <span className="absolute -bottom-4 left-1 text-[10px] font-bold text-red-600 z-10 whitespace-nowrap">
          {isJa ? "日付形式エラー (YYYY-MM-DD)" : "날짜 형식 오류 (YYYY-MM-DD)"}
        </span>
      )}
    </div>
  );
}
