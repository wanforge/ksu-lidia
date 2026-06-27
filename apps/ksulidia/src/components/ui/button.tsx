/**
 * Tombol standar aplikasi — satu komponen untuk semua aksi.
 *
 * Menggantikan ratusan `<button className="inline-flex ...">` ad-hoc agar
 * tampilan, ukuran, fokus, dan state disabled konsisten. Warna mengikuti
 * brand: teal (primary), rose (danger), amber (warning), gray (neutral/ghost).
 *
 * Pemakaian:
 *   <Button onClick={...}>Simpan</Button>                  // primary, sm
 *   <Button variant="danger" size="md" isLoading>Hapus</Button>
 *   <Button variant="neutral" type="submit">Batal</Button>
 *   <Button as="a" href="/x" variant="primary-soft">Ekspor</Button>
 */
import { forwardRef } from "react";
import cn from "@core/utils/class-names";

export type ButtonVariant =
  | "primary"
  | "primary-soft"
  | "danger"
  | "danger-soft"
  | "warning"
  | "neutral"
  | "ghost";

export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60";

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-primary text-primary-foreground hover:bg-primary-dark focus-visible:ring-primary",
  "primary-soft":
    "border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 focus-visible:ring-primary",
  danger:
    "border border-transparent bg-red text-white hover:bg-red-dark focus-visible:ring-red",
  "danger-soft":
    "border border-red/20 bg-red/5 text-red hover:bg-red/10 focus-visible:ring-red",
  warning:
    "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 focus-visible:ring-amber-500",
  neutral:
    "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400",
  ghost:
    "border border-transparent bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-gray-400",
};

function Spinner() {
  return (
    <svg
      className="h-3.5 w-3.5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & {
    as?: "button";
  };

type ButtonAsAnchor = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps> & {
    as: "a";
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export const Button = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const {
    variant = "primary",
    size = "sm",
    isLoading = false,
    className,
    children,
    ...rest
  } = props;

  const classes = cn(base, sizeStyles[size], variantStyles[variant], className);

  if (props.as === "a") {
    const { as: _as, ...anchorRest } =
      rest as React.AnchorHTMLAttributes<HTMLAnchorElement> & { as?: "a" };
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...anchorRest}
      >
        {isLoading && <Spinner />}
        {children}
      </a>
    );
  }

  const {
    as: _as,
    type = "button",
    disabled,
    ...buttonRest
  } = rest as React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" };

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      disabled={disabled || isLoading}
      className={classes}
      {...buttonRest}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
