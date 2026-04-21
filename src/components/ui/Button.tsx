import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
}

const variantStyles = {
  primary: "bg-ink text-white hover:bg-[#173150]",
  secondary: "bg-white text-ink border border-sky/80 hover:bg-mist",
  ghost: "bg-transparent text-ink hover:bg-white/70",
};

export function Button({ variant = "primary", icon, className = "", children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
