"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, isAdminAuthenticated } = useAdmin();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAdminAuthenticated) router.replace("/admin");
  }, [isAdminAuthenticated, router]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("사번 또는 이메일을 입력하세요.");
      return;
    }
    const result = loginAdmin(identifier);
    if (result.success) router.replace("/admin");
    else setError(result.message ?? "로그인에 실패했습니다.");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-white p-8 shadow-2xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold text-white">管</div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 로그인</h1>
          <p className="mt-2 text-sm text-gray-500">현장 시스템 사용자와 권한을 관리합니다.</p>
        </div>
        <form onSubmit={submit} className="space-y-5">
          <label className="block text-sm font-semibold text-gray-700">
            사번 또는 이메일
            <input value={identifier} onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700">로그인</button>
        </form>
        <p className="mt-5 text-center text-xs text-gray-400">데모 관리자 사번: A001</p>
      </div>
    </main>
  );
}
