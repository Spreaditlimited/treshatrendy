"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
        Email
        <input
          className="h-12 rounded-md border border-[#d6c7b7] bg-white px-4 text-base outline-none transition focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label className="grid gap-2 text-sm font-medium text-[#3b2a22]">
        Password
        <input
          className="h-12 rounded-md border border-[#d6c7b7] bg-white px-4 text-base outline-none transition focus:border-[#8d4931] focus:ring-2 focus:ring-[#8d4931]/15"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>

      {state.error ? (
        <p className="rounded-md border border-[#e2b4a9] bg-[#fff3ef] px-4 py-3 text-sm font-medium text-[#8d2f1d]">
          {state.error}
        </p>
      ) : null}

      <button
        className="h-12 rounded-md bg-[#201713] px-5 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#3b2a22] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
