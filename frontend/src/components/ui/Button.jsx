const VARIANTS = {
  primary: "bg-emerald text-white hover:bg-emerald-deep shadow-[0_14px_28px_-14px_rgba(6,78,59,0.6)]",
  amber: "bg-gradient-to-br from-peach to-orange text-ink hover:brightness-105 shadow-[0_14px_28px_-14px_rgba(200,110,20,0.55)]",
  secondary: "card-soft text-ink hover:brightness-95",
  ghost: "text-ink-soft hover:text-ink",
  danger: "bg-white text-red-600 shadow-[0_10px_20px_-12px_rgba(0,0,0,0.2)] hover:bg-red-50",
  "room-primary": "bg-white text-emerald-dark hover:bg-white/90",
  "room-secondary": "room-card text-white hover:bg-white/10",
};

const SIZES = {
  sm: "px-4 py-1.5 text-[13px]",
  md: "px-5 py-2.5 text-[14px]",
  lg: "px-7 py-3.5 text-[15px]",
};

export default function Button({
  as: Component = "button",
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  children,
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${
        VARIANTS[variant] || VARIANTS.primary
      } ${SIZES[size] || SIZES.md} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </Component>
  );
}
