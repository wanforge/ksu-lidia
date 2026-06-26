import React from "react";

export default function AnimatedLogoShort({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      role="img"
      aria-label="KSULIDIA"
      className={className}
    >
      <defs>
        <style>{`
          /* ── Entry Animations ─────────────────────────────────────── */
          @keyframes apls-up {
            from { opacity: 0; transform: translateY(7px); }
            to   { opacity: 1; transform: translateY(0px); }
          }

          /* ── Bob/Breathe animation ────────────────────────────────── */
          @keyframes apls-bob {
            0%, 100% { transform: translateY(0px) rotate(0.0deg); }
            50%      { transform: translateY(-8px) rotate(0.5deg); }
          }

          /* ── Tree leaves breathing ─────────────────────────────────── */
          @keyframes apls-leaf-breath {
            0%, 100% { transform: scale(1.0); }
            50%      { transform: scale(1.05); }
          }

          /* ── Coin rotating / pulse ────────────────────────────────── */
          @keyframes apls-coin-pulse {
            0%, 100% { transform: scale(1.0); filter: drop-shadow(0 0 0px rgba(212,175,55,0)); }
            50%      { transform: scale(1.08); filter: drop-shadow(0 0 8px rgba(212,175,55,0.6)); }
          }

          /* ── Class bindings ──────────────────────────────────────────── */
          .apls-group {
            animation: apls-up 0.5s ease-out both, apls-bob 5s ease-in-out infinite 0.5s;
          }

          /* Leaves animations */
          .apls-leaf-b1, .apls-leaf-b2,
          .apls-leaf-m1, .apls-leaf-m2,
          .apls-leaf-t1, .apls-leaf-t2 {
            transform-box: fill-box;
            transform-origin: center bottom;
          }

          .apls-leaf-b1 { animation: apls-leaf-breath 4s ease-in-out infinite 0.1s; }
          .apls-leaf-b2 { animation: apls-leaf-breath 4s ease-in-out infinite 0.3s; }
          .apls-leaf-m1 { animation: apls-leaf-breath 4s ease-in-out infinite 0.5s; }
          .apls-leaf-m2 { animation: apls-leaf-breath 4s ease-in-out infinite 0.7s; }
          .apls-leaf-t1 { animation: apls-leaf-breath 4s ease-in-out infinite 0.9s; }
          .apls-leaf-t2 { animation: apls-leaf-breath 4s ease-in-out infinite 1.1s; }

          .apls-coin-group {
            transform-box: fill-box;
            transform-origin: center;
            animation: apls-coin-pulse 3s ease-in-out infinite;
          }

          /* Accessibility: respect reduced-motion preference */
          @media (prefers-reduced-motion: reduce) {
            .apls-group, .apls-leaf-b1, .apls-leaf-b2, .apls-leaf-m1,
            .apls-leaf-m2, .apls-leaf-t1, .apls-leaf-t2, .apls-coin-group { animation: none; }
          }
        `}</style>
      </defs>

      <g className="apls-group">
        {/* Shield Base */}
        <path
          d="M256,40 L440,110 L440,340 C440,430 256,480 256,480 C256,480 72,430 72,340 L72,110 Z"
          fill="#991b1b"
          stroke="#d4af37"
          strokeWidth="16"
          strokeLinejoin="round"
        />
        
        {/* Inner Shield Glow */}
        <path
          d="M256,60 L420,125 L420,330 C420,410 256,455 256,455 C256,455 92,410 92,330 L92,125 Z"
          fill="none"
          stroke="#ea580c"
          strokeWidth="6"
          opacity="0.80"
        />

        {/* Cooperative Tree Trunk / Stem */}
        <line
          x1="256"
          y1="360"
          x2="256"
          y2="150"
          stroke="#d4af37"
          strokeWidth="14"
          strokeLinecap="round"
        />

        {/* Leaves (Growth / Savings) */}
        {/* Bottom Leaves */}
        <path
          d="M256,310 C180,310 160,250 210,230 C240,215 256,250 256,250"
          fill="#ea580c"
          className="apls-leaf-b1"
        />
        <path
          d="M256,310 C332,310 352,250 302,230 C272,215 256,250 256,250"
          fill="#ea580c"
          className="apls-leaf-b2"
        />

        {/* Middle Leaves */}
        <path
          d="M256,250 C180,250 160,190 210,170 C240,155 256,190 256,190"
          fill="#fb923c"
          className="apls-leaf-m1"
        />
        <path
          d="M256,250 C332,250 352,190 302,170 C272,155 256,190 256,190"
          fill="#fb923c"
          className="apls-leaf-m2"
        />

        {/* Top Leaves */}
        <path
          d="M256,190 C180,190 160,130 210,110 C240,95 256,130 256,130"
          fill="#ffedd5"
          className="apls-leaf-t1"
        />
        <path
          d="M256,190 C332,190 352,130 302,110 C272,95 256,130 256,130"
          fill="#ffedd5"
          className="apls-leaf-t2"
        />

        {/* Golden Financial Coin & Retail Shopfront base */}
        <g className="apls-coin-group">
          {/* Coin border */}
          <circle
            cx="256"
            cy="375"
            r="55"
            fill="#d4af37"
            stroke="#7f1d1d"
            strokeWidth="8"
          />
          {/* Inner dash ring */}
          <circle
            cx="256"
            cy="375"
            r="45"
            fill="none"
            stroke="#ffedd5"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
          {/* Shopfront body */}
          <path
            d="M236,395 L236,370 L256,350 L276,370 L276,395 Z"
            fill="#991b1b"
          />
          {/* Shopfront roof */}
          <path
            d="M230,370 L256,346 L282,370"
            fill="none"
            stroke="#ffedd5"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Shopfront door */}
          <rect
            x="248"
            y="374"
            width="16"
            height="21"
            fill="#d4af37"
            rx="2"
          />
        </g>
      </g>
    </svg>
  );
}
