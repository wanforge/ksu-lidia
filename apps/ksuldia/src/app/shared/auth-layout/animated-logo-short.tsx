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
          @keyframes apls-scan {
            0%   { transform: translate(  0px,  0px) rotate(  0deg); }
            18%  { transform: translate( -7px, -5px) rotate( -3deg); }
            42%  { transform: translate(  9px, -8px) rotate(  2deg); }
            65%  { transform: translate( 10px,  6px) rotate(  3deg); }
            88%  { transform: translate( -5px,  4px) rotate( -2deg); }
            100% { transform: translate(  0px,  0px) rotate(  0deg); }
          }
          @keyframes apls-dl {
            0%, 55%, 100% { transform: scaleX(1);    }
            28%           { transform: scaleX(0.68); }
          }
          @keyframes apls-hb {
            0%, 100%  { transform: scale(1.00); }
            8%        { transform: scale(1.40); }
            16%       { transform: scale(1.12); }
            24%       { transform: scale(1.34); }
            38%       { transform: scale(1.00); }
          }
          @keyframes apls-ca { 0%, 100% { opacity: 0.82; } 50% { opacity: 1;    } }
          @keyframes apls-cb { 0%, 100% { opacity: 1;    } 50% { opacity: 0.80; } }

          .apls-scan {
            transform-box: fill-box; transform-origin: center;
            animation: apls-scan 7s ease-in-out infinite;
          }
          .apls-dl1 { transform-box: fill-box; transform-origin: left center; animation: apls-dl 4.5s ease-in-out 0.00s infinite; }
          .apls-dl2 { transform-box: fill-box; transform-origin: left center; animation: apls-dl 4.5s ease-in-out 0.45s infinite; }
          .apls-dl3 { transform-box: fill-box; transform-origin: left center; animation: apls-dl 4.5s ease-in-out 0.90s infinite; }
          .apls-dl4 { transform-box: fill-box; transform-origin: left center; animation: apls-dl 4.5s ease-in-out 1.35s infinite; }
          .apls-dl5 { transform-box: fill-box; transform-origin: left center; animation: apls-dl 4.5s ease-in-out 1.80s infinite; }
          .apls-dl6 { transform-box: fill-box; transform-origin: left center; animation: apls-dl 4.5s ease-in-out 2.25s infinite; }
          .apls-hb1 { transform-box: fill-box; transform-origin: center; animation: apls-hb 3.2s ease-in-out 0.0s infinite; }
          .apls-hb2 { transform-box: fill-box; transform-origin: center; animation: apls-hb 3.2s ease-in-out 1.6s infinite; }
          .apls-ca  { animation: apls-ca 4s ease-in-out 0.0s infinite; }
          .apls-cb  { animation: apls-cb 4s ease-in-out 0.0s infinite; }

          @media (prefers-reduced-motion: reduce) {
            .apls-scan,.apls-dl1,.apls-dl2,.apls-dl3,.apls-dl4,.apls-dl5,.apls-dl6,
            .apls-hb1,.apls-hb2,.apls-ca,.apls-cb { animation: none; }
          }
        `}</style>
      </defs>

      <g transform="matrix(1,0,0,1,9.514007,0.948)">
        {/* Background stacked cards — depth breathe */}
        <g className="apls-ca">
          <rect
            x="434.539"
            y="188.93"
            width="283.395"
            height="358.967"
            rx="7"
            fill="#00b9ae"
            opacity="0.45"
            transform="matrix(0.984808,-0.173648,0.173648,0.984808,-451.096008,-55.878983)"
          />
        </g>
        <g className="apls-cb">
          <rect
            x="566.79"
            y="181.373"
            width="283.395"
            height="358.967"
            rx="7"
            fill="#02c3bd"
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
          fill="#037171"
        />
        <polygon
          points="325.815 -0.948 391.94 -0.948 325.815 65.177"
          fill="#03312e"
        />
        <line
          x1="316.951"
          y1="-0.948"
          x2="316.951"
          y2="65.177"
          stroke="#009f93"
          strokeWidth="1"
        />
        <line
          x1="316.951"
          y1="65.177"
          x2="383.076"
          y2="-0.948"
          stroke="#009f93"
          strokeWidth="1"
        />

        {/* Document lines — data-read wave */}
        <rect
          className="apls-dl1"
          x="129.349"
          y="99.185"
          width="160.59"
          height="15.114"
          rx="4"
          fill="#02c3bd"
          opacity="0.80"
        />
        <rect
          className="apls-dl2"
          x="129.349"
          y="136.971"
          width="204.044"
          height="15.114"
          rx="4"
          fill="#02c3bd"
          opacity="0.60"
        />
        <rect
          className="apls-dl3"
          x="129.349"
          y="174.757"
          width="179.483"
          height="15.114"
          rx="4"
          fill="#02c3bd"
          opacity="0.55"
        />
        <rect
          className="apls-dl4"
          x="129.349"
          y="212.543"
          width="141.697"
          height="15.114"
          rx="4"
          fill="#02c3bd"
          opacity="0.45"
        />
        <rect
          className="apls-dl5"
          x="129.349"
          y="250.329"
          width="170.037"
          height="15.114"
          rx="4"
          fill="#02c3bd"
          opacity="0.40"
        />
        <rect
          className="apls-dl6"
          x="129.349"
          y="288.115"
          width="122.804"
          height="15.114"
          rx="4"
          fill="#02c3bd"
          opacity="0.35"
        />

        {/* Card base */}
        <rect
          x="0.877"
          y="393.915"
          width="491.218"
          height="30.229"
          rx="5"
          fill="#00b9ae"
        />
        <rect
          x="15.991"
          y="420.366"
          width="460.989"
          height="90.686"
          rx="5"
          fill="#037171"
        />
        <rect
          x="189.807"
          y="397.694"
          width="113.358"
          height="18.893"
          rx="5"
          fill="#037171"
        />
        <rect
          x="46.22"
          y="443.037"
          width="400.531"
          height="41.565"
          rx="3"
          fill="#009f93"
          opacity="0.5"
        />
        <rect
          x="76.449"
          y="458.262"
          width="151.144"
          height="11.336"
          rx="3"
          fill="#02c3bd"
          opacity="0.7"
        />
        <rect
          x="76.449"
          y="477.155"
          width="103.911"
          height="11.336"
          rx="3"
          fill="#02c3bd"
          opacity="0.5"
        />

        {/* Magnifying glass — scanning wander */}
        <g className="apls-scan">
          <circle
            cx="388.183"
            cy="216.321"
            r="68.015"
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
        <g className="apls-hb1">
          <circle cx="53.777" cy="50.063" r="25.559" fill="#f0a500" />
          <circle cx="53.777" cy="50.063" r="12.598" fill="#fff8e8" />
        </g>

        {/* Gold dot bottom-right — heartbeat offset */}
        <g className="apls-hb2">
          <circle
            cx="450.53"
            cy="480.823"
            r="20.152"
            fill="#f0a500"
            opacity="0.7"
          />
        </g>
      </g>
    </svg>
  );
}
