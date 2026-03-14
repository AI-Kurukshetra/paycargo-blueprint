"use client";

import { useState } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";

export function AuthPanel(): JSX.Element {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <>
      <div className="mt-6 inline-flex rounded-full bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("sign-in")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "sign-in" ? "bg-white text-ink shadow-sm" : "text-slate-500"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("sign-up")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "sign-up" ? "bg-white text-ink shadow-sm" : "text-slate-500"
          }`}
        >
          Create account
        </button>
      </div>
      {mode === "sign-in" ? <SignInForm onModeChange={setMode} /> : <SignUpForm onModeChange={setMode} />}
    </>
  );
}
