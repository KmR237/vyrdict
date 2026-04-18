import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-4 py-20">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
        <span className="text-3xl font-black text-slate-300">?</span>
      </div>
      <h1 className="text-2xl font-black text-foreground mb-2">Page introuvable</h1>
      <p className="text-sm text-muted mb-6 text-center max-w-sm">Cette page n&apos;existe pas ou a été déplacée.</p>
      <div className="flex gap-3">
        <Link href="/" className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
          Analyser mon CT
        </Link>
        <Link href="/guide-controle-technique" className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-white hover:shadow-sm transition-all">
          Guide CT
        </Link>
      </div>
    </div>
  );
}
