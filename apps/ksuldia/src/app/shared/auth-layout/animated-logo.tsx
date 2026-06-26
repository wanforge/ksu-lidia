import React from "react";

const ICON = (
  <g transform="matrix(0.9, 0, 0, 0.9, 25.6, 25.6)">
    {/* Shield Base */}
    <path
      d="M256,40 L440,110 L440,340 C440,430 256,480 256,480 C256,480 72,430 72,340 L72,110 Z"
      fill="#991b1b"
      stroke="#d4af37"
      strokeWidth="16"
      strokeLinejoin="round"
      className="apl-shield"
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
      className="apl-trunk"
    />

    {/* Leaves (Growth / Savings) */}
    {/* Bottom Leaves */}
    <path
      d="M256,310 C180,310 160,250 210,230 C240,215 256,250 256,250"
      fill="#ea580c"
      className="apl-leaf-b1"
    />
    <path
      d="M256,310 C332,310 352,250 302,230 C272,215 256,250 256,250"
      fill="#ea580c"
      className="apl-leaf-b2"
    />

    {/* Middle Leaves */}
    <path
      d="M256,250 C180,250 160,190 210,170 C240,155 256,190 256,190"
      fill="#fb923c"
      className="apl-leaf-m1"
    />
    <path
      d="M256,250 C332,250 352,190 302,170 C272,155 256,190 256,190"
      fill="#fb923c"
      className="apl-leaf-m2"
    />

    {/* Top Leaves */}
    <path
      d="M256,190 C180,190 160,130 210,110 C240,95 256,130 256,130"
      fill="#ffedd5"
      className="apl-leaf-t1"
    />
    <path
      d="M256,190 C332,190 352,130 302,110 C272,95 256,130 256,130"
      fill="#ffedd5"
      className="apl-leaf-t2"
    />

    {/* Golden Financial Coin & Retail Shopfront base */}
    <g className="apl-coin-group">
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
);

export default function AnimatedLogo({
  className,
  float = true,
}: {
  className?: string;
  float?: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 360"
      role="img"
      aria-label="KSULIDIA"
      className={className}
    >
      <defs>
        <style>{`
          /* ── Entry Animations ─────────────────────────────────────── */
          @keyframes apl-up {
            from { opacity: 0; transform: translateY(7px); }
            to   { opacity: 1; transform: translateY(0px); }
          }

          /* ── Float bob (signin only) ────────────────────────────────── */
          @keyframes apl-bob {
            0%   { transform: translate(  0px,  0px) rotate( 0.0deg); }
            28%  { transform: translate( -2px, -8px) rotate(-0.5deg); }
            55%  { transform: translate(  3px,-10px) rotate( 0.4deg); }
            78%  { transform: translate( -1px, -5px) rotate(-0.2deg); }
            100% { transform: translate(  0px,  0px) rotate( 0.0deg); }
          }

          /* ── Tree leaves breathing ─────────────────────────────────── */
          @keyframes apl-leaf-breath {
            0%, 100% { transform: scale(1.0); }
            50%      { transform: scale(1.05); }
          }

          /* ── Coin rotating / pulse ────────────────────────────────── */
          @keyframes apl-coin-pulse {
            0%, 100% { transform: scale(1.0); filter: drop-shadow(0 0 0px rgba(212,175,55,0)); }
            50%      { transform: scale(1.08); filter: drop-shadow(0 0 8px rgba(212,175,55,0.6)); }
          }

          /* ── Class bindings ──────────────────────────────────────────── */
          .apl-icon { animation: apl-up 0.50s ease-out 0.00s both; }
          .apl-txt  { animation: apl-up 0.50s ease-out 0.20s both; }

          .apl-bob  { animation: apl-bob 5.5s ease-in-out infinite; }

          /* Leaves animations */
          .apl-leaf-b1, .apl-leaf-b2,
          .apl-leaf-m1, .apl-leaf-m2,
          .apl-leaf-t1, .apl-leaf-t2 {
            transform-box: fill-box;
            transform-origin: center bottom;
          }

          .apl-leaf-b1 { animation: apl-leaf-breath 4s ease-in-out infinite 0.1s; }
          .apl-leaf-b2 { animation: apl-leaf-breath 4s ease-in-out infinite 0.3s; }
          .apl-leaf-m1 { animation: apl-leaf-breath 4s ease-in-out infinite 0.5s; }
          .apl-leaf-m2 { animation: apl-leaf-breath 4s ease-in-out infinite 0.7s; }
          .apl-leaf-t1 { animation: apl-leaf-breath 4s ease-in-out infinite 0.9s; }
          .apl-leaf-t2 { animation: apl-leaf-breath 4s ease-in-out infinite 1.1s; }

          .apl-coin-group {
            transform-box: fill-box;
            transform-origin: center;
            animation: apl-coin-pulse 3s ease-in-out infinite;
          }

          /* Accessibility: respect reduced-motion preference */
          @media (prefers-reduced-motion: reduce) {
            .apl-icon,.apl-txt { animation: none; opacity: 1; }
            .apl-bob, .apl-leaf-b1, .apl-leaf-b2, .apl-leaf-m1,
            .apl-leaf-m2, .apl-leaf-t1, .apl-leaf-t2, .apl-coin-group { animation: none; }
          }
        `}</style>
      </defs>

      {/* ── Text ─────────────────────────────────────────────────── */}
      <g transform="matrix(1,0,0,1,0,5.343361)" className="apl-txt">
        <text
          x="390"
          y="185"
          fontFamily="Lexend, Inter, sans-serif"
          fontWeight="800"
          fontSize="115"
          fill="rgb(153, 27, 27)"
          letterSpacing="2"
          className="dark:fill-red-400"
        >
          KSU <tspan fill="rgb(212, 175, 55)" className="dark:fill-yellow-500">LIDIA</tspan>
        </text>
        <text
          x="395"
          y="245"
          fontFamily="Lexend, Inter, sans-serif"
          fontWeight="600"
          fontSize="34"
          fill="rgb(194, 65, 12)"
          letterSpacing="1"
          className="dark:fill-orange-400"
        >
          Koperasi Simpan Pinjam & Toko GKJ Manahan
        </text>
      </g>

      {/* ── Icon ─────────────────────────────────────────────────── */}
      <g className="apl-icon">
        {float ? <g className="apl-bob">{ICON}</g> : ICON}
      </g>
    </svg>
  );
}
