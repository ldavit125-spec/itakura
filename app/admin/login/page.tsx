"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, isAdminAuthenticated, adminSessionReady } = useAdmin();
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (adminSessionReady && isAdminAuthenticated) router.replace("/admin");
  }, [adminSessionReady, isAdminAuthenticated, router]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!identifier.trim() || !password.trim()) {
      setError(t("admin.login.validation.required"));
      return;
    }
    const result = loginAdmin(identifier, password);
    if (result.success) router.replace("/admin");
    else setError(result.message ?? t("admin.login.error"));
  };

  return (
    <main
      className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4"
      style={{ backgroundImage: "url('/login_bg.png')" }}
    >
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
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
          <h1 className="text-2xl font-bold text-gray-900">{t("admin.login.title")}</h1>
          <p className="mt-2 text-sm text-gray-500">{t("admin.login.description")}</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-sm font-semibold text-gray-700">
            {t("admin.login.identifier")}
            <input value={identifier} onChange={(event) => setIdentifier(event.target.value)}
              placeholder="예: A001 또는 admin@itakura.demo"
              autoComplete="username" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          <label className="block text-sm font-semibold text-gray-700">
            {t("admin.login.password")}
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)}
              placeholder={t("admin.login.passwordPlaceholder")}
              autoComplete="current-password" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700">{t("action.login")}</button>
        </form>
        <p className="mt-5 text-center text-xs text-gray-400">{t("admin.login.demoHint")}</p>
      </div>
    </main>
  );
}
