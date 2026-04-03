import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PrimaryButton({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      className={`px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold hover:shadow-lg hover:shadow-teal-500/20 hover:-translate-y-0.5 transition-[transform,box-shadow] cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
