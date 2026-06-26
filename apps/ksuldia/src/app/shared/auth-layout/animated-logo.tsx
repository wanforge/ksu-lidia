import React from "react";

const ICON = (
  <g transform="matrix(0.703125, 0, 0, 0.703125, -0.616638, 0.666544)">
    {/* Background stacked cards — alternate depth breathe */}
    <g className="apl-ca">
      <rect
        x="434.539"
        y="188.93"
        width="283.395"
        height="358.967"
        rx="7"
        fill="#ea580c"
        opacity="0.45"
        transform="matrix(0.984808,-0.173648,0.173648,0.984808,-451.096008,-55.878983)"
      />
    </g>
    <g className="apl-cb">
      <rect
        x="566.79"
        y="181.373"
        width="283.395"
        height="358.967"
        rx="7"
        fill="#fb923c"
        opacity="0.55"
        transform="matrix(0.992546,0.121869,-0.121869,0.992546,-346.617767,-245.191437)"
      />
    </g>

    {/* Main document */}
    <rect
      x="85.895"
      y="-0.948"
      width="321.181"
      height="387.306"
      rx="7"
      fill="#991b1b"
    />
    <polygon
      points="325.815 -0.948 391.94 -0.948 325.815 65.177"
      fill="#7f1d1d"
    />
    <line
      x1="316.951"
      y1="-0.948"
      x2="316.951"
      y2="65.177"
      stroke="#d4af37"
      strokeWidth="1"
    />
    <line
      x1="316.951"
      y1="65.177"
      x2="383.076"
      y2="-0.948"
      stroke="#d4af37"
      strokeWidth="1"
    />

    {/* Document lines — data-read wave (scaleX staggered) */}
    <rect
      className="apl-dl1"
      x="129.349"
      y="110.873"
      width="234.272"
      height="20.301"
      rx="4"
      fill="#ffefcf"
    />
    <rect
      className="apl-dl2"
      x="129.349"
      y="152.923"
      width="234.272"
      height="20.301"
      rx="4"
      fill="#ffefcf"
    />
    <rect
      className="apl-dl3"
      x="129.349"
      y="194.973"
      width="234.272"
      height="20.301"
      rx="4"
      fill="#ffefcf"
    />
    <rect
      className="apl-dl4"
      x="129.349"
      y="237.023"
      width="234.272"
      height="20.301"
      rx="4"
      fill="#ffefcf"
    />
    <rect
      className="apl-dl5"
      x="129.349"
      y="279.073"
      width="153.257"
      height="20.301"
      rx="4"
      fill="#ffefcf"
    />

    {/* Magnifying glass — verification scan loop */}
    <g className="apl-scan">
      <path
        d="M388.183 277.656C422.057 277.656 449.518 250.195 449.518 216.321C449.518 182.447 422.057 154.986 388.183 154.986C354.309 154.986 326.848 182.447 326.848 216.321C326.848 250.195 354.309 277.656 388.183 277.656Z"
        fill="none"
        stroke="#f0a500"
        strokeWidth="14"
      />
      <circle cx="388.183" cy="216.321" r="47.335" fill="#f0a50015" />
      <line
        x1="438.416"
        y1="266.554"
        x2="479.98"
        y2="310.008"
        stroke="#f0a500"
        strokeLinecap="round"
        strokeWidth="14"
      />
    </g>

    {/* Gold dot top-left — heartbeat */}
    <g className="apl-hb1">
      <circle cx="53.777" cy="50.063" r="25.559" fill="#f0a500" />
      <circle cx="53.777" cy="50.063" r="12.598" fill="#fff8e8" />
    </g>

    {/* Gold dot bottom-right — heartbeat offset */}
    <g className="apl-hb2">
      <circle
        cx="450.53"
        cy="480.823"
        r="20.152"
        fill="#f0a500"
        opacity="0.7"
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
          /* ── Entry ─────────────────────────────────────────────────── */
          @keyframes apl-up {
            from { opacity: 0; transform: translateY(7px); }
            to   { opacity: 1; transform: translateY(0px); }
          }

          /* ── Float bob (signin only) ────────────────────────────────── */
          @keyframes apl-bob {
            0%   { transform: translate(  0px,  0px) rotate( 0.0deg); }
            28%  { transform: translate( -2px, -8px) rotate(-0.8deg); }
            55%  { transform: translate(  3px,-10px) rotate( 0.6deg); }
            78%  { transform: translate( -1px, -5px) rotate(-0.3deg); }
            100% { transform: translate(  0px,  0px) rotate( 0.0deg); }
          }

          /* ── Magnifying glass wander (verification scan) ─────────────── */
          @keyframes apl-scan {
            0%   { transform: translate(  0px,  0px) rotate(  0deg); }
            18%  { transform: translate( -7px, -5px) rotate( -3deg); }
            42%  { transform: translate(  9px, -8px) rotate(  2deg); }
            65%  { transform: translate( 10px,  6px) rotate(  3deg); }
            88%  { transform: translate( -5px,  4px) rotate( -2deg); }
            100% { transform: translate(  0px,  0px) rotate(  0deg); }
          }

          /* ── Document lines — data-read wave ─────────────────────────── */
          @keyframes apl-dl {
            0%, 55%, 100% { transform: scaleX(1);    }
            28%           { transform: scaleX(0.68); }
          }

          /* ── Heartbeat (double-beat then rest) ──────────────────────── */
          @keyframes apl-hb {
            0%, 100%  { transform: scale(1.00); }
            8%        { transform: scale(1.40); }
            16%       { transform: scale(1.12); }
            24%       { transform: scale(1.34); }
            38%       { transform: scale(1.00); }
          }

          /* ── Background card depth breathe ───────────────────────────── */
          @keyframes apl-ca { 0%, 100% { opacity: 0.82; } 50% { opacity: 1; } }
          @keyframes apl-cb { 0%, 100% { opacity: 1;    } 50% { opacity: 0.80; } }

          /* ── Class bindings ──────────────────────────────────────────── */
          .apl-icon { animation: apl-up 0.50s ease-out 0.00s both; }
          .apl-txt  { animation: apl-up 0.50s ease-out 0.20s both; }

          /* Idle loops */
          .apl-bob  { animation: apl-bob 5.5s ease-in-out infinite; }

          .apl-scan {
            transform-box: fill-box; transform-origin: center;
            animation: apl-scan 7s ease-in-out infinite;
          }
          .apl-dl1 { transform-box: fill-box; transform-origin: left center;
                     animation: apl-dl 4.5s ease-in-out 0.00s infinite; }
          .apl-dl2 { transform-box: fill-box; transform-origin: left center;
                     animation: apl-dl 4.5s ease-in-out 0.45s infinite; }
          .apl-dl3 { transform-box: fill-box; transform-origin: left center;
                     animation: apl-dl 4.5s ease-in-out 0.90s infinite; }
          .apl-dl4 { transform-box: fill-box; transform-origin: left center;
                     animation: apl-dl 4.5s ease-in-out 1.35s infinite; }
          .apl-dl5 { transform-box: fill-box; transform-origin: left center;
                     animation: apl-dl 4.5s ease-in-out 1.80s infinite; }

          .apl-hb1 { transform-box: fill-box; transform-origin: center;
                     animation: apl-hb 3.2s ease-in-out 0.0s infinite; }
          .apl-hb2 { transform-box: fill-box; transform-origin: center;
                     animation: apl-hb 3.2s ease-in-out 1.6s infinite; }

          .apl-ca { animation: apl-ca 4s ease-in-out 0.0s infinite; }
          .apl-cb { animation: apl-cb 4s ease-in-out 0.0s infinite; }

          /* Accessibility: respect reduced-motion preference */
          @media (prefers-reduced-motion: reduce) {
            .apl-icon,.apl-txt { animation: none; opacity: 1; }
            .apl-bob,.apl-scan,.apl-dl1,.apl-dl2,.apl-dl3,
            .apl-dl4,.apl-dl5,.apl-hb1,.apl-hb2,
            .apl-ca,.apl-cb { animation: none; }
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
