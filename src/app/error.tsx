"use client";

import { PrimaryButton } from "@/components/PrimaryButton";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-20">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <svg className="w-8 h-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="font-bold text-lg">Une erreur est survenue</h2>
        <p className="text-sm text-muted mt-1 max-w-sm">Quelque chose s&apos;est mal passé. Veuillez réessayer.</p>
      </div>
      <PrimaryButton onClick={reset}>Réessayer</PrimaryButton>
    </div>
  );
}
