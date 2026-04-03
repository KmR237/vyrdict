import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 py-20">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center">
        <span className="text-3xl font-extrabold text-stone-400">404</span>
      </div>
      <div className="text-center">
        <h2 className="font-bold text-lg">Page introuvable</h2>
        <p className="text-sm text-muted mt-1">Cette page n&apos;existe pas ou a été déplacée.</p>
      </div>
      <Link href="/" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:shadow-lg hover:shadow-teal-500/20 transition-[transform,box-shadow]">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
