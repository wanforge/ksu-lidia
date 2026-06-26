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
        fill="#00b9ae"
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

    {/* Document lines — data-read wave (scaleX staggered) */}
    <rect
      className="apl-dl1"
      x="129.349"
      y="99.185"
      width="160.59"
      height="15.114"
      rx="4"
      fill="#02c3bd"
      opacity="0.80"
    />
    <rect
      className="apl-dl2"
      x="129.349"
      y="136.971"
      width="204.044"
      height="15.114"
      rx="4"
      fill="#02c3bd"
      opacity="0.60"
    />
    <rect
      className="apl-dl3"
      x="129.349"
      y="174.757"
      width="179.483"
      height="15.114"
      rx="4"
      fill="#02c3bd"
      opacity="0.55"
    />
    <rect
      className="apl-dl4"
      x="129.349"
      y="212.543"
      width="141.697"
      height="15.114"
      rx="4"
      fill="#02c3bd"
      opacity="0.45"
    />
    <rect
      className="apl-dl5"
      x="129.349"
      y="250.329"
      width="170.037"
      height="15.114"
      rx="4"
      fill="#02c3bd"
      opacity="0.40"
    />
    <rect
      className="apl-dl6"
      x="129.349"
      y="288.115"
      width="122.804"
      height="15.114"
      rx="4"
      fill="#02c3bd"
      opacity="0.35"
    />

    {/* Card base / ID card holder */}
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
    <g className="apl-scan">
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

          /* ── Gold "S" brand pulse ──────────────────────────────────── */
          @keyframes apl-sg {
            0%, 100% { opacity: 1;    transform: scale(1);    }
            50%      { opacity: 0.70; transform: scale(0.96); }
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
          /* Entry — letters staggered */
          .apl-icon { animation: apl-up 0.50s ease-out 0.00s both; }
          .apl-l1   { animation: apl-up 0.45s ease-out 0.08s both; }
          .apl-l2   { animation: apl-up 0.45s ease-out 0.15s both; }
          .apl-l3   { animation: apl-up 0.45s ease-out 0.22s both; }
          /* "S" has entry + idle glow — fill-box so scale pivots on the letter itself */
          .apl-l4   { transform-box: fill-box; transform-origin: center;
                      animation: apl-up 0.45s ease-out 0.29s both,
                                 apl-sg 4.0s ease-in-out 0.85s infinite; }
          .apl-l5   { animation: apl-up 0.45s ease-out 0.36s both; }
          .apl-l6   { animation: apl-up 0.45s ease-out 0.43s both; }
          .apl-l7   { animation: apl-up 0.45s ease-out 0.50s both; }
          .apl-sub  { animation: apl-up 0.45s ease-out 0.65s both; }

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
          .apl-dl6 { transform-box: fill-box; transform-origin: left center;
                     animation: apl-dl 4.5s ease-in-out 2.25s infinite; }

          .apl-hb1 { transform-box: fill-box; transform-origin: center;
                     animation: apl-hb 3.2s ease-in-out 0.0s infinite; }
          .apl-hb2 { transform-box: fill-box; transform-origin: center;
                     animation: apl-hb 3.2s ease-in-out 1.6s infinite; }

          .apl-ca { animation: apl-ca 4s ease-in-out 0.0s infinite; }
          .apl-cb { animation: apl-cb 4s ease-in-out 0.0s infinite; }

          /* Accessibility: respect reduced-motion preference */
          @media (prefers-reduced-motion: reduce) {
            .apl-icon,.apl-l1,.apl-l2,.apl-l3,.apl-l4,
            .apl-l5,.apl-l6,.apl-l7,.apl-sub { animation: none; opacity: 1; }
            .apl-bob,.apl-scan,.apl-dl1,.apl-dl2,.apl-dl3,
            .apl-dl4,.apl-dl5,.apl-dl6,.apl-hb1,.apl-hb2,
            .apl-ca,.apl-cb { animation: none; }
          }
        `}</style>
      </defs>

      {/* ── Text ─────────────────────────────────────────────────── */}
      <g transform="matrix(1,0,0,1,0,5.343361)">
        {/* PERSONA — one wrapper per letter for staggered entry */}
        <g aria-label="KSULIDIA">
          {/* P */}
          <g className="apl-l1">
            <path
              transform="translate(401.320 201.511) scale(0.053942 -0.053942)"
              fill="rgb(3,113,113)"
              d="M132 0V2048H1016Q1244 2048 1415.0 1958.0Q1586 1868 1681.0 1705.0Q1776 1542 1776 1324Q1776 1104 1678.5 943.0Q1581 782 1405.5 695.0Q1230 608 996 608H468V1040H884Q982 1040 1051.5 1074.5Q1121 1109 1158.5 1173.0Q1196 1237 1196 1324Q1196 1412 1158.5 1474.5Q1121 1537 1051.5 1570.5Q982 1604 884 1604H688V0Z"
            />
          </g>
          {/* E */}
          <g className="apl-l2">
            <path
              transform="translate(508.204 201.511) scale(0.053942 -0.053942)"
              fill="rgb(3,113,113)"
              d="M132 0V2048H1608V1600H688V1248H1532V800H688V448H1604V0Z"
            />
          </g>
          {/* R */}
          <g className="apl-l3">
            <path
              transform="translate(609.910 201.511) scale(0.053942 -0.053942)"
              fill="rgb(3,113,113)"
              d="M132 0V2048H1016Q1244 2048 1415.0 1965.0Q1586 1882 1681.0 1726.0Q1776 1570 1776 1352Q1776 1132 1678.5 981.0Q1581 830 1405.5 753.0Q1230 676 996 676H468V1108H884Q982 1108 1051.5 1132.5Q1121 1157 1158.5 1211.0Q1196 1265 1196 1352Q1196 1440 1158.5 1495.5Q1121 1551 1051.5 1577.5Q982 1604 884 1604H688V0ZM1332 940 1844 0H1240L740 940Z"
            />
          </g>
          {/* S — gold + idle pulse */}
          <g className="apl-l4">
            <path
              transform="translate(718.521 201.511) scale(0.053942 -0.053942)"
              fill="rgb(240,165,0)"
              d="M1236 1408Q1228 1508 1161.5 1564.0Q1095 1620 960 1620Q874 1620 819.5 1599.5Q765 1579 739.0 1544.0Q713 1509 712 1464Q710 1427 725.5 1397.5Q741 1368 775.0 1344.5Q809 1321 862.0 1302.0Q915 1283 988 1268L1156 1232Q1326 1196 1447.0 1137.0Q1568 1078 1645.0 998.5Q1722 919 1758.5 820.0Q1795 721 1796 604Q1795 402 1695.0 262.0Q1595 122 1409.5 49.0Q1224 -24 964 -24Q697 -24 498.5 55.0Q300 134 190.5 298.5Q81 463 80 720H608Q613 626 655.0 562.0Q697 498 773.5 465.0Q850 432 956 432Q1045 432 1105.0 454.0Q1165 476 1196.0 515.0Q1227 554 1228 604Q1227 651 1197.5 686.5Q1168 722 1101.0 750.5Q1034 779 920 804L716 848Q444 907 287.5 1045.5Q131 1184 132 1424Q131 1619 236.5 1765.5Q342 1912 529.5 1994.0Q717 2076 960 2076Q1208 2076 1389.0 1993.0Q1570 1910 1668.5 1759.5Q1767 1609 1768 1408Z"
            />
          </g>
          {/* O */}
          <g className="apl-l5">
            <path
              transform="translate(826.915 201.511) scale(0.053942 -0.053942)"
              fill="rgb(3,113,113)"
              d="M2116 1024Q2116 682 1983.0 447.5Q1850 213 1624.0 92.5Q1398 -28 1120 -28Q840 -28 614.5 93.5Q389 215 256.5 449.5Q124 684 124 1024Q124 1366 256.5 1600.5Q389 1835 614.5 1955.5Q840 2076 1120 2076Q1398 2076 1624.0 1955.5Q1850 1835 1983.0 1600.5Q2116 1366 2116 1024ZM1544 1024Q1544 1208 1495.5 1334.5Q1447 1461 1352.5 1526.5Q1258 1592 1120 1592Q982 1592 887.5 1526.5Q793 1461 744.5 1334.5Q696 1208 696 1024Q696 840 744.5 713.5Q793 587 887.5 521.5Q982 456 1120 456Q1258 456 1352.5 521.5Q1447 587 1495.5 713.5Q1544 840 1544 1024Z"
            />
          </g>
          {/* N */}
          <g className="apl-l6">
            <path
              transform="translate(954.945 201.511) scale(0.053942 -0.053942)"
              fill="rgb(3,113,113)"
              d="M1904 2048V0H1440L700 1076H688V0H132V2048H604L1332 976H1348V2048Z"
            />
          </g>
          {/* A */}
          <g className="apl-l7">
            <path
              transform="translate(1071.970 201.511) scale(0.053942 -0.053942)"
              fill="rgb(3,113,113)"
              d="M664 0H64L740 2048H1500L2176 0H1576L1128 1484H1112ZM552 808H1680V392H552Z"
            />
          </g>
        </g>

        {/* Subtitle */}
        <g aria-label="Rapih, Aman, Berwajah" className="apl-sub">
          <path
            transform="translate(407.237 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M248 0V2048H940Q1180 2048 1334.0 1966.5Q1488 1885 1562.0 1743.0Q1636 1601 1636 1420Q1636 1239 1562.0 1099.0Q1488 959 1335.0 879.5Q1182 800 944 800H384V1024H936Q1100 1024 1200.5 1072.0Q1301 1120 1346.5 1208.5Q1392 1297 1392 1420Q1392 1543 1346.0 1635.0Q1300 1727 1199.0 1777.5Q1098 1828 932 1828H496V0ZM1212 920 1716 0H1428L932 920Z"
          />
          <path
            transform="translate(452.593 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M668 -36Q522 -36 403.0 19.5Q284 75 214.0 180.5Q144 286 144 436Q144 568 196.0 650.5Q248 733 335.0 780.0Q422 827 527.5 850.5Q633 874 740 888Q880 906 967.5 915.5Q1055 925 1095.5 948.0Q1136 971 1136 1028V1036Q1136 1184 1055.5 1266.0Q975 1348 812 1348Q643 1348 547.0 1274.0Q451 1200 412 1116L188 1196Q248 1336 348.5 1414.5Q449 1493 568.5 1524.5Q688 1556 804 1556Q878 1556 974.5 1538.5Q1071 1521 1161.5 1467.0Q1252 1413 1312.0 1304.0Q1372 1195 1372 1012V0H1136V208H1124Q1100 158 1044.0 101.0Q988 44 895.0 4.0Q802 -36 668 -36ZM704 176Q844 176 940.5 231.0Q1037 286 1086.5 373.0Q1136 460 1136 556V772Q1121 754 1070.5 739.5Q1020 725 954.5 714.5Q889 704 827.5 696.5Q766 689 728 684Q636 672 556.5 645.5Q477 619 428.5 566.5Q380 514 380 424Q380 301 471.5 238.5Q563 176 704 176Z"
          />
          <path
            transform="translate(493.079 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M216 -576V1536H444V1292H472Q498 1332 544.5 1394.5Q591 1457 678.5 1506.5Q766 1556 916 1556Q1110 1556 1258.0 1459.0Q1406 1362 1489.0 1184.0Q1572 1006 1572 764Q1572 520 1489.0 341.5Q1406 163 1259.0 65.5Q1112 -32 920 -32Q772 -32 683.0 17.5Q594 67 546.0 130.5Q498 194 472 236H452V-576ZM448 768Q448 594 499.0 461.5Q550 329 648.0 254.5Q746 180 888 180Q1036 180 1135.5 258.5Q1235 337 1285.5 470.5Q1336 604 1336 768Q1336 930 1286.5 1060.5Q1237 1191 1137.5 1267.5Q1038 1344 888 1344Q744 1344 646.0 1271.5Q548 1199 498.0 1069.5Q448 940 448 768Z"
          />
          <path
            transform="translate(536.505 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M216 0V1536H452V0ZM336 1792Q267 1792 217.5 1839.0Q168 1886 168 1952Q168 2018 217.5 2065.0Q267 2112 336 2112Q405 2112 454.5 2065.0Q504 2018 504 1952Q504 1886 454.5 1839.0Q405 1792 336 1792Z"
          />
          <path
            transform="translate(555.853 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M452 924V0H216V2048H452V1296H472Q526 1415 634.5 1485.5Q743 1556 924 1556Q1081 1556 1199.0 1493.5Q1317 1431 1382.5 1302.5Q1448 1174 1448 976V0H1212V960Q1212 1143 1117.5 1243.5Q1023 1344 856 1344Q740 1344 648.5 1295.0Q557 1246 504.5 1152.0Q452 1058 452 924Z"
          />
          <path
            transform="translate(598.085 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M568 280 552 172Q535 58 500.5 -72.0Q466 -202 429.0 -317.0Q392 -432 368 -500H188Q201 -436 222.0 -331.0Q243 -226 264.5 -96.5Q286 33 300 168L312 280Z"
          />
          <path
            transform="translate(646.387 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M332 0H72L824 2048H1080L1832 0H1572L960 1724H944ZM428 800H1476V580H428Z"
          />
          <path
            transform="translate(694.133 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M216 0V1536H444V1296H464Q512 1419 619.0 1487.5Q726 1556 876 1556Q1028 1556 1129.5 1487.5Q1231 1419 1288 1296H1304Q1363 1415 1481.0 1485.5Q1599 1556 1764 1556Q1970 1556 2101.0 1427.5Q2232 1299 2232 1028V0H1996V1028Q1996 1198 1903.0 1271.0Q1810 1344 1684 1344Q1522 1344 1433.0 1246.5Q1344 1149 1344 1000V0H1104V1052Q1104 1183 1019.0 1263.5Q934 1344 800 1344Q708 1344 628.5 1295.0Q549 1246 500.5 1159.5Q452 1073 452 960V0Z"
          />
          <path
            transform="translate(754.378 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M668 -36Q522 -36 403.0 19.5Q284 75 214.0 180.5Q144 286 144 436Q144 568 196.0 650.5Q248 733 335.0 780.0Q422 827 527.5 850.5Q633 874 740 888Q880 906 967.5 915.5Q1055 925 1095.5 948.0Q1136 971 1136 1028V1036Q1136 1184 1055.5 1266.0Q975 1348 812 1348Q643 1348 547.0 1274.0Q451 1200 412 1116L188 1196Q248 1336 348.5 1414.5Q449 1493 568.5 1524.5Q688 1556 804 1556Q878 1556 974.5 1538.5Q1071 1521 1161.5 1467.0Q1252 1413 1312.0 1304.0Q1372 1195 1372 1012V0H1136V208H1124Q1100 158 1044.0 101.0Q988 44 895.0 4.0Q802 -36 668 -36ZM704 176Q844 176 940.5 231.0Q1037 286 1086.5 373.0Q1136 460 1136 556V772Q1121 754 1070.5 739.5Q1020 725 954.5 714.5Q889 704 827.5 696.5Q766 689 728 684Q636 672 556.5 645.5Q477 619 428.5 566.5Q380 514 380 424Q380 301 471.5 238.5Q563 176 704 176Z"
          />
          <path
            transform="translate(794.863 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M452 924V0H216V1536H444V1296H464Q518 1413 628.0 1484.5Q738 1556 912 1556Q1068 1556 1185.0 1492.5Q1302 1429 1367.0 1300.5Q1432 1172 1432 976V0H1196V960Q1196 1141 1102.0 1242.5Q1008 1344 844 1344Q731 1344 642.5 1295.0Q554 1246 503.0 1152.0Q452 1058 452 924Z"
          />
          <path
            transform="translate(836.728 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M568 280 552 172Q535 58 500.5 -72.0Q466 -202 429.0 -317.0Q392 -432 368 -500H188Q201 -436 222.0 -331.0Q243 -226 264.5 -96.5Q286 33 300 168L312 280Z"
          />
          <path
            transform="translate(885.029 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M248 0V2048H964Q1178 2048 1317.0 1974.5Q1456 1901 1524.0 1777.5Q1592 1654 1592 1504Q1592 1372 1545.5 1286.0Q1499 1200 1423.5 1150.0Q1348 1100 1260 1076V1056Q1354 1050 1449.0 990.0Q1544 930 1608.0 818.0Q1672 706 1672 544Q1672 390 1602.0 267.0Q1532 144 1381.0 72.0Q1230 0 988 0ZM496 220H988Q1231 220 1333.5 314.5Q1436 409 1436 544Q1436 648 1383.0 736.5Q1330 825 1232.0 878.5Q1134 932 1000 932H496ZM496 1148H956Q1068 1148 1158.5 1192.0Q1249 1236 1302.5 1316.0Q1356 1396 1356 1504Q1356 1639 1262.0 1733.5Q1168 1828 964 1828H496Z"
          />
          <path
            transform="translate(931.121 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M860 -32Q638 -32 477.5 66.5Q317 165 230.5 342.5Q144 520 144 756Q144 992 230.5 1172.5Q317 1353 472.5 1454.5Q628 1556 836 1556Q956 1556 1073.0 1516.0Q1190 1476 1286.0 1386.5Q1382 1297 1439.0 1150.0Q1496 1003 1496 788V688H312V892H1256Q1256 1022 1204.5 1124.0Q1153 1226 1058.5 1285.0Q964 1344 836 1344Q695 1344 592.5 1274.5Q490 1205 435.0 1094.0Q380 983 380 856V720Q380 546 440.5 425.5Q501 305 609.0 242.5Q717 180 860 180Q953 180 1028.5 206.5Q1104 233 1159.0 286.5Q1214 340 1244 420L1472 356Q1436 240 1351.0 152.5Q1266 65 1141.0 16.5Q1016 -32 860 -32Z"
          />
          <path
            transform="translate(972.802 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M216 0V1536H444V1304H460Q502 1418 612.0 1489.0Q722 1560 860 1560Q886 1560 925.0 1559.0Q964 1558 984 1556V1316Q972 1319 929.5 1325.5Q887 1332 840 1332Q728 1332 640.5 1285.5Q553 1239 502.5 1157.5Q452 1076 452 972V0Z"
          />
          <path
            transform="translate(1000.880 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M564 0 96 1536H344L676 360H692L1020 1536H1272L1596 364H1612L1944 1536H2192L1724 0H1492L1156 1180H1132L796 0Z"
          />
          <path
            transform="translate(1057.449 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M668 -36Q522 -36 403.0 19.5Q284 75 214.0 180.5Q144 286 144 436Q144 568 196.0 650.5Q248 733 335.0 780.0Q422 827 527.5 850.5Q633 874 740 888Q880 906 967.5 915.5Q1055 925 1095.5 948.0Q1136 971 1136 1028V1036Q1136 1184 1055.5 1266.0Q975 1348 812 1348Q643 1348 547.0 1274.0Q451 1200 412 1116L188 1196Q248 1336 348.5 1414.5Q449 1493 568.5 1524.5Q688 1556 804 1556Q878 1556 974.5 1538.5Q1071 1521 1161.5 1467.0Q1252 1413 1312.0 1304.0Q1372 1195 1372 1012V0H1136V208H1124Q1100 158 1044.0 101.0Q988 44 895.0 4.0Q802 -36 668 -36ZM704 176Q844 176 940.5 231.0Q1037 286 1086.5 373.0Q1136 460 1136 556V772Q1121 754 1070.5 739.5Q1020 725 954.5 714.5Q889 704 827.5 696.5Q766 689 728 684Q636 672 556.5 645.5Q477 619 428.5 566.5Q380 514 380 424Q380 301 471.5 238.5Q563 176 704 176Z"
          />
          <path
            transform="translate(1097.935 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M216 1536H452V-112Q452 -254 403.5 -358.0Q355 -462 257.5 -519.0Q160 -576 12 -576Q0 -576 -12.0 -576.0Q-24 -576 -36 -576V-356Q-24 -356 -14.0 -356.0Q-4 -356 8 -356Q116 -356 166.0 -292.5Q216 -229 216 -112ZM332 1792Q263 1792 213.5 1839.0Q164 1886 164 1952Q164 2018 213.5 2065.0Q263 2112 332 2112Q401 2112 450.5 2065.0Q500 2018 500 1952Q500 1886 450.5 1839.0Q401 1792 332 1792Z"
          />
          <path
            transform="translate(1117.283 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M668 -36Q522 -36 403.0 19.5Q284 75 214.0 180.5Q144 286 144 436Q144 568 196.0 650.5Q248 733 335.0 780.0Q422 827 527.5 850.5Q633 874 740 888Q880 906 967.5 915.5Q1055 925 1095.5 948.0Q1136 971 1136 1028V1036Q1136 1184 1055.5 1266.0Q975 1348 812 1348Q643 1348 547.0 1274.0Q451 1200 412 1116L188 1196Q248 1336 348.5 1414.5Q449 1493 568.5 1524.5Q688 1556 804 1556Q878 1556 974.5 1538.5Q1071 1521 1161.5 1467.0Q1252 1413 1312.0 1304.0Q1372 1195 1372 1012V0H1136V208H1124Q1100 158 1044.0 101.0Q988 44 895.0 4.0Q802 -36 668 -36ZM704 176Q844 176 940.5 231.0Q1037 286 1086.5 373.0Q1136 460 1136 556V772Q1121 754 1070.5 739.5Q1020 725 954.5 714.5Q889 704 827.5 696.5Q766 689 728 684Q636 672 556.5 645.5Q477 619 428.5 566.5Q380 514 380 424Q380 301 471.5 238.5Q563 176 704 176Z"
          />
          <path
            transform="translate(1157.768 279.544) scale(0.022976 -0.022976)"
            fill="rgb(240,165,0)"
            d="M452 924V0H216V2048H452V1296H472Q526 1415 634.5 1485.5Q743 1556 924 1556Q1081 1556 1199.0 1493.5Q1317 1431 1382.5 1302.5Q1448 1174 1448 976V0H1212V960Q1212 1143 1117.5 1243.5Q1023 1344 856 1344Q740 1344 648.5 1295.0Q557 1246 504.5 1152.0Q452 1058 452 924Z"
          />
        </g>
      </g>

      {/* ── Icon ─────────────────────────────────────────────────── */}
      <g className="apl-icon">
        {float ? <g className="apl-bob">{ICON}</g> : ICON}
      </g>
    </svg>
  );
}
