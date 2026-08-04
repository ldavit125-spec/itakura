"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, isAdminAuthenticated, adminSessionReady } = useAdmin();
  const { language, setLanguage, t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (adminSessionReady && isAdminAuthenticated) router.replace("/admin");
  }, [adminSessionReady, isAdminAuthenticated, router]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setErrorKey("");
    if (!identifier.trim() || !password.trim()) {
      setErrorKey("auth.requiredEmployeeId");
      return;
    }
    setIsSubmitting(true);
    const result = loginAdmin(identifier, password);
    setIsSubmitting(false);
    if (result.success) {
      router.replace("/admin");
    } else {
      setErrorKey(result.message ?? "auth.invalidCredentials");
    }
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: "url('/login_bg.png')" }}
    >
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
      
      {/* 상단 우측 언어 선택 */}
      <div className="absolute top-4 right-4 z-20">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "ko" | "ja")}
          className="rounded-md border border-slate-600 bg-slate-900/80 px-3 py-1.5 text-xs text-white backdrop-blur-md outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Language Selector"
        >
          <option value="ko">한국어</option>
          <option value="ja">日本語</option>
        </select>
      </div>

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700/60 bg-white/95 p-8 shadow-2xl backdrop-blur-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <Image
              src="/logo_white.png"
              alt="이타쿠라 베이커리 (ITAKURA BAKERY)"
              width={240}
              height={80}
              className="h-14 w-auto object-contain drop-shadow-md brightness-0"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("auth.title")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("auth.description")}</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-sm font-semibold text-gray-700">
            {t("auth.employeeId")}
            <input value={identifier} onChange={(event) => setIdentifier(event.target.value)}
              placeholder="예: A001"
              autoComplete="username" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            {t("auth.password")}
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)}
              placeholder={t("admin.login.passwordPlaceholder")}
              autoComplete="current-password" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          {errorKey && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{t(errorKey)}</p>}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? t("auth.loggingIn") : t("auth.login")}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-gray-400">{t("admin.login.demoHint")}</p>
      </div>
    </main>
  );
}
