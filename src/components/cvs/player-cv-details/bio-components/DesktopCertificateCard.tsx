/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";

export const DesktopCertificateCard = ({ playerData }: { playerData: any }) => {
  return (
    <div className="hidden xl:block p-4 sm:p-6 border-none rounded-2xl relative overflow-hidden group hover:border-primary/20 transition-all w-full min-w-0">
      {/* SVG certificate container */}
      <div className="w-full max-w-full aspect-square relative select-none">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 800 800"
          width="100%"
          height="100%"
        >
          <defs>
            <style>{`
              @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
              .gold-text {
                fill: url(#gold-grad-static);
              }
              .white-text {
                fill: #FFFFFF;
              }
              .badge-heading {
                font-family: 'Montserrat', 'Inter', sans-serif;
                text-transform: uppercase;
              }
              .badge-content {
                font-family: 'Inter', 'Montserrat', sans-serif;
              }
            `}</style>
            <linearGradient id="gold-grad-static" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BF953F" />
              <stop offset="20%" stopColor="#FCF6BA" />
              <stop offset="40%" stopColor="#B38728" />
              <stop offset="60%" stopColor="#FBF5B7" />
              <stop offset="80%" stopColor="#AA771C" />
              <stop offset="100%" stopColor="#E2C175" />
            </linearGradient>
            <linearGradient id="gold-bright-static" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FCF6BA" />
              <stop offset="35%" stopColor="#FFEFA6" />
              <stop offset="70%" stopColor="#B38728" />
              <stop offset="100%" stopColor="#FCF6BA" />
            </linearGradient>
            <linearGradient id="gold-dark-static" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8a6f27" />
              <stop offset="50%" stopColor="#4e3a0b" />
              <stop offset="100%" stopColor="#8a6f27" />
            </linearGradient>
            <linearGradient id="gold-divider-static" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#BF953F" stopOpacity="0" />
              <stop offset="30%" stopColor="#FCF6BA" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#B38728" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#FCF6BA" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#AA771C" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="bg-radial-static" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
              <stop offset="0%" stopColor="#0a2a53" />
              <stop offset="55%" stopColor="#05152e" />
              <stop offset="90%" stopColor="#010615" />
              <stop offset="100%" stopColor="#000207" />
            </radialGradient>
            <linearGradient id="ribbon-grad-static" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#020e24" />
              <stop offset="12%" stopColor="#061b3b" />
              <stop offset="34%" stopColor="#0f3468" />
              <stop offset="50%" stopColor="#19488a" />
              <stop offset="66%" stopColor="#0f3468" />
              <stop offset="88%" stopColor="#061b3b" />
              <stop offset="100%" stopColor="#020e24" />
            </linearGradient>
            <filter id="drop-shadow-static" x="-10%" y="-10%" width="120%" height="125%">
              <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#000000" floodOpacity="0.65" />
            </filter>
            <filter id="glow-static" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <g id="leaf-node-static">
              <path d="M 0,0 C -6,-10 -18,-18 -25,-14 C -18,1 -6,4 0,0" fill="url(#gold-grad-static)" stroke="url(#gold-dark-static)" strokeWidth="0.5" />
              <path d="M 0,0 C 6,-10 18,-18 25,-14 C 18,1 6,4 0,0" fill="url(#gold-bright-static)" stroke="url(#gold-dark-static)" strokeWidth="0.5" />
            </g>
            <g id="wreath-half-static">
              <path d="M -30,0 Q -95,-15 -136,-72" fill="none" stroke="url(#gold-grad-static)" strokeWidth="3" strokeLinecap="round" />
              <g transform="translate(-42, -1) rotate(-15) scale(0.65)"><use href="#leaf-node-static" /></g>
              <g transform="translate(-62, -6) rotate(-30) scale(0.75)"><use href="#leaf-node-static" /></g>
              <g transform="translate(-82, -14) rotate(-45) scale(0.85)"><use href="#leaf-node-static" /></g>
              <g transform="translate(-101, -24) rotate(-60) scale(0.95)"><use href="#leaf-node-static" /></g>
              <g transform="translate(-118, -37) rotate(-75) scale(0.95)"><use href="#leaf-node-static" /></g>
              <g transform="translate(-130, -52) rotate(-90) scale(0.85)"><use href="#leaf-node-static" /></g>
              <g transform="translate(-136, -69) rotate(-105) scale(0.75)"><use href="#leaf-node-static" /></g>
              <g transform="translate(-137, -86) rotate(-120) scale(0.60)"><use href="#leaf-node-static" /></g>
            </g>
            <path id="top-text-arc-shared" d="M 124,400 A 276,276 0 0,1 676,400" fill="none" />
            <filter id="green-glow-static" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="green-radar-glow-static" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="green-chart-fill-static" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="red-chart-fill-static" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <polygon points="400.00,20.00 414.21,38.28 429.81,21.17 442.55,40.51 459.45,24.68 470.62,44.96 488.71,30.50 498.26,51.59 517.43,38.60 525.29,60.37 545.42,48.93 551.55,71.25 572.52,61.42 576.88,84.16 598.55,76.00 601.12,99.01 623.36,92.57 624.11,115.72 646.79,111.05 645.73,134.18 668.70,131.30 665.82,154.27 688.95,153.21 684.28,175.89 707.43,176.64 700.99,198.88 724.00,201.45 715.84,223.12 738.58,227.48 728.75,248.45 751.07,254.58 739.63,274.71 761.40,282.57 748.41,301.74 769.50,311.29 755.04,329.38 775.32,340.55 759.49,357.45 778.83,370.19 761.72,385.79 780.00,400.00 761.72,414.21 778.83,429.81 759.49,442.55 775.32,459.45 755.04,470.62 769.50,488.71 748.41,498.26 761.40,517.43 739.63,525.29 751.07,545.42 728.75,551.55 738.58,572.52 715.84,576.88 724.00,598.55 700.99,601.12 707.43,623.36 684.28,624.11 688.95,646.79 665.82,645.73 668.70,668.70 645.73,665.82 646.79,688.95 624.11,684.28 623.36,707.43 601.12,700.99 598.55,724.00 576.88,715.84 572.52,738.58 551.55,728.75 545.42,751.07 525.29,739.63 517.43,761.40 498.26,748.41 488.71,769.50 470.62,755.04 459.45,775.32 442.55,759.49 429.81,778.83 414.21,761.72 400.00,780.00 385.79,761.72 370.19,778.83 357.45,759.49 340.55,775.32 329.38,755.04 311.29,769.50 301.74,748.41 282.57,761.40 274.71,739.63 254.58,751.07 248.45,728.75 227.48,738.58 223.12,715.84 201.45,724.00 198.88,700.99 176.64,707.43 175.89,684.28 153.21,688.95 154.27,665.82 131.30,668.70 134.18,645.73 111.05,646.79 115.72,624.11 92.57,623.36 99.01,601.12 76.00,598.55 84.16,576.88 61.42,572.52 71.25,551.55 48.93,545.42 60.37,525.29 38.60,517.43 51.59,498.26 30.50,488.71 44.96,470.62 24.68,459.45 40.51,442.55 21.17,429.81 38.28,414.21 20.00,400.00 38.28,385.79 21.17,370.19 40.51,357.45 24.68,340.55 44.96,329.38 30.50,311.29 51.59,301.74 38.60,282.57 60.37,274.71 48.93,254.58 71.25,248.45 61.42,227.48 84.16,223.12 76.00,201.45 99.01,198.88 92.57,176.64 115.72,175.89 111.05,153.21 134.18,154.27 131.30,131.30 154.27,134.18 153.21,111.05 175.89,115.72 176.64,92.57 198.88,99.01 201.45,76.00 223.12,84.16 227.48,61.42 248.45,71.25 254.58,48.93 274.71,60.37 282.57,38.60 301.74,51.59 311.29,30.50 329.38,44.96 340.55,24.68 357.45,40.51 370.19,21.17 385.79,38.28" fill="url(#gold-grad-static)" filter="url(#drop-shadow-static)" />
          <circle cx="400" cy="400" r="358" stroke="url(#gold-dark-static)" strokeWidth="1.5" fill="none" />
          <circle cx="400" cy="400" r="352" stroke="url(#gold-grad-static)" strokeWidth="3" fill="none" />
          <circle cx="400" cy="400" r="344" stroke="url(#gold-bright-static)" strokeWidth="1.5" fill="none" />
          <circle cx="400" cy="400" r="334" fill="url(#bg-radial-static)" />
          <circle cx="400" cy="400" r="334" stroke="url(#gold-grad-static)" strokeWidth="3.5" fill="none" />
          <circle cx="400" cy="400" r="322" stroke="url(#gold-bright-static)" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.8" />
          <circle cx="400" cy="400" r="312" stroke="url(#gold-dark-static)" strokeWidth="1.5" fill="none" />

          {/* Arched Top Header */}
          <text fontSize="25" fontWeight="900" className="badge-heading gold-text" letterSpacing="4">
            <textPath href="#top-text-arc-shared" startOffset="50%" textAnchor="middle">
              FEDERAÇÃO INTERNACIONAL DE FUTEBOL
            </textPath>
          </text>

          {/* Gold Laurel Olive Wreath */}
          <use href="#wreath-half-static" transform="translate(400, 245) scale(1.15)" />
          <use href="#wreath-half-static" transform="translate(400, 245) scale(-1.15, 1.15)" />

          {/* Top Crown Emblem */}
          <g filter="url(#glow-static)" transform="translate(400, 115)">
            <path d="M -22,12 L -28,-10 L -10,-2 L 0,-18 L 10,-2 L 28,-10 L 22,12 Z" fill="url(#gold-bright-static)" stroke="url(#gold-dark-static)" strokeWidth="1" />
            <circle cx="-28" cy="-11" r="2.5" fill="#FFFFFF" />
            <circle cx="0" cy="-19" r="3" fill="#FFFFFF" />
            <circle cx="28" cy="-11" r="2.5" fill="#FFFFFF" />
            <circle cx="-10" cy="-2" r="2" fill="#FFFFFF" />
            <circle cx="10" cy="-2" r="2" fill="#FFFFFF" />
            <rect x="-19" y="8" width="38" height="3" fill="url(#gold-dark-static)" rx="1" />
          </g>

          {/* Coach Name Block */}
          <g transform="translate(400, 192)">
            <text x="0" y="0" fontSize="13" fontWeight="800" className="badge-heading gold-text" textAnchor="middle" letterSpacing="5">HEAD COACH</text>
            <text x="0" y="38" fontSize="38" fontWeight="900" className="badge-content white-text" textAnchor="middle" letterSpacing="1.5">
              {playerData.coachName || "ALEXANDRE SILVA"}
            </text>
            <line x1="-120" y1="52" x2="120" y2="52" stroke="url(#gold-divider-static)" strokeWidth="1.8" />
            <circle cx="0" cy="52" r="4.5" fill="url(#gold-bright-static)" />
            <circle cx="-130" cy="52" r="2.5" fill="url(#gold-bright-static)" />
            <circle cx="130" cy="52" r="2.5" fill="url(#gold-bright-static)" />
          </g>

          {/* Middle 3-Row Information Container */}
          <g transform="translate(0, -6)">
            {/* Row 1: Academy Name */}
            <g transform="translate(0, -4)">
              <circle cx="220" cy="365" r="28" fill="#010c1e" stroke="url(#gold-grad-static)" strokeWidth="2.5" />
              <circle cx="220" cy="365" r="24" fill="none" stroke="url(#gold-bright-static)" strokeWidth="0.5" opacity="0.4" />
              <polygon points="220,350 207,358 233,358" fill="url(#gold-bright-static)" />
              <line x1="210" y1="360" x2="210" y2="372" stroke="url(#gold-bright-static)" strokeWidth="2" strokeLinecap="round" />
              <line x1="216" y1="360" x2="216" y2="372" stroke="url(#gold-bright-static)" strokeWidth="2" strokeLinecap="round" />
              <line x1="224" y1="360" x2="224" y2="372" stroke="url(#gold-bright-static)" strokeWidth="2" strokeLinecap="round" />
              <line x1="230" y1="360" x2="230" y2="372" stroke="url(#gold-bright-static)" strokeWidth="2" strokeLinecap="round" />
              <line x1="205" y1="374" x2="235" y2="374" stroke="url(#gold-bright-static)" strokeWidth="2.5" strokeLinecap="round" />
              <text x="265" y="354" fontSize="14" fontWeight="800" className="badge-heading gold-text" letterSpacing="1.5" opacity="0.95">TRAINING ACADEMY</text>
              <text x="265" y="382" fontSize="28" fontWeight="900" className="badge-content white-text" letterSpacing="0.5">{playerData.academyName || "SANTOS FC ACADEMY"}</text>
              <line x1="210" y1="408" x2="590" y2="408" stroke="url(#gold-divider-static)" strokeWidth="1.5" />
            </g>
            {/* Row 2: License Number */}
            <g transform="translate(0, 86)">
              <circle cx="220" cy="365" r="28" fill="#010c1e" stroke="url(#gold-grad-static)" strokeWidth="2.5" />
              <circle cx="220" cy="365" r="24" fill="none" stroke="url(#gold-bright-static)" strokeWidth="0.5" opacity="0.4" />
              <rect x="209" y="350" width="22" height="28" rx="2.5" fill="none" stroke="url(#gold-bright-static)" strokeWidth="2" />
              <line x1="215" y1="355" x2="225" y2="355" stroke="url(#gold-bright-static)" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="216" cy="364" r="2.5" fill="url(#gold-bright-static)" />
              <line x1="222" y1="358" x2="231" y2="358" stroke="url(#gold-bright-static)" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="222" y1="364" x2="231" y2="364" stroke="url(#gold-bright-static)" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="222" y1="370" x2="228" y2="370" stroke="url(#gold-bright-static)" strokeWidth="1.8" strokeLinecap="round" />
              <text x="265" y="354" fontSize="14" fontWeight="800" className="badge-heading gold-text" letterSpacing="1.5" opacity="0.95">LICENSE NUMBER</text>
              <text x="265" y="382" fontSize="28" fontWeight="900" className="badge-content white-text" letterSpacing="0.5">{playerData.coachLicenseNumber || "CBF-2026-4587"}</text>
              <line x1="210" y1="408" x2="590" y2="408" stroke="url(#gold-divider-static)" strokeWidth="1.5" />
            </g>
            {/* Row 3: Club Managed */}
            <g transform="translate(0, 176)">
              <circle cx="220" cy="365" r="28" fill="#010c1e" stroke="url(#gold-grad-static)" strokeWidth="2.5" />
              <circle cx="220" cy="365" r="24" fill="none" stroke="url(#gold-bright-static)" strokeWidth="0.5" opacity="0.4" />
              <path d="M 207,352 Q 220,348 233,352 L 233,366 Q 233,378 220,383 Q 207,378 207,366 Z" fill="none" stroke="url(#gold-bright-static)" strokeWidth="2.2" strokeLinejoin="round" />
              <circle cx="220" cy="366" r="6" fill="none" stroke="url(#gold-bright-static)" strokeWidth="1.5" />
              <line x1="220" y1="360" x2="220" y2="372" stroke="url(#gold-bright-static)" strokeWidth="1" />
              <line x1="214" y1="366" x2="226" y2="366" stroke="url(#gold-bright-static)" strokeWidth="1" />
              <text x="265" y="354" fontSize="14" fontWeight="800" className="badge-heading gold-text" letterSpacing="1.5" opacity="0.95">CLUB MANAGED</text>
              <text x="265" y="382" fontSize="28" fontWeight="900" className="badge-content white-text" letterSpacing="0.5">{playerData.clubManaged || "Atlético Nacional"}</text>
            </g>
          </g>

          {/* 3D Ribbon / Banner Overlay */}
          <g filter="url(#drop-shadow-static)">
            <polygon points="175,615 175,655 150,635" fill="url(#gold-dark-static)" />
            <polygon points="625,615 625,655 650,635" fill="url(#gold-dark-static)" />
            <path d="M 175,615 L 80,635 L 110,665 L 85,695 L 175,655 Z" fill="url(#ribbon-grad-static)" stroke="url(#gold-grad-static)" strokeWidth="2" />
            <path d="M 625,615 L 720,635 L 690,665 L 715,695 L 625,655 Z" fill="url(#ribbon-grad-static)" stroke="url(#gold-grad-static)" strokeWidth="2" />
            <path d="M 148,595 Q 400,565 652,595 L 642,675 Q 400,645 158,675 Z" fill="url(#ribbon-grad-static)" stroke="url(#gold-grad-static)" strokeWidth="3" />
            <path id="ribbon-text-path-static" d="M 160,635 Q 400,605 640,635" fill="none" />
            <path id="ribbon-subtext-path-static" d="M 175,662 Q 400,632 625,662" fill="none" />
            <text fontSize="42" fontWeight="900" className="badge-content">
              <textPath href="#ribbon-text-path-static" startOffset="50%" textAnchor="middle" fill="#FFFFFF">
                Player CV
              </textPath>
            </text>
            <text fontSize="18" fontWeight="800" className="badge-heading" letterSpacing="3.5">
              <textPath href="#ribbon-subtext-path-static" startOffset="50%" textAnchor="middle" fill="url(#gold-bright-static)">
                VERIFIED BY FOOTBALL COACH
              </textPath>
            </text>
          </g>

          {/* Center-Bottom Checkmark Coin Emblem with olive branches */}
          <use href="#wreath-half-static" transform="translate(400, 712) scale(0.60)" />
          <use href="#wreath-half-static" transform="translate(400, 712) scale(-0.60, 0.60)" />
          <g filter="url(#drop-shadow-static)">
            <circle cx="400" cy="712" r="30" fill="url(#bg-radial-static)" stroke="url(#gold-grad-static)" strokeWidth="4.5" />
            <circle cx="400" cy="712" r="24" fill="url(#bg-radial-static)" stroke="url(#gold-bright-static)" strokeWidth="1.2" opacity="0.6" />
            <path d="M 386,713 L 396,723 L 416,700" fill="none" stroke="url(#gold-bright-static)" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Bottom stars */}
          <path d="M 400,728 L 400.00,728.00 L 402.65,734.36 L 409.51,734.91 L 404.28,739.39 L 405.88,746.09 L 400.00,742.50 L 394.12,746.09 L 395.72,739.39 L 390.49,734.91 L 397.35,734.36 Z" fill="url(#gold-bright-static)" />
          <path d="M 478.9,720.66 L 478.90,720.66 L 480.96,725.83 L 486.51,726.19 L 482.23,729.74 L 483.60,735.13 L 478.90,732.16 L 474.20,735.13 L 475.57,729.74 L 471.29,726.19 L 476.84,725.83 Z" fill="url(#gold-bright-static)" />
          <path d="M 321.1,720.66 L 321.10,720.66 L 323.16,725.83 L 328.71,726.19 L 324.43,729.74 L 325.80,735.13 L 321.10,732.16 L 316.40,735.13 L 317.77,729.74 L 313.49,726.19 L 319.04,725.83 Z" fill="url(#gold-bright-static)" />
          <path d="M 553.45,694.16 L 553.45,694.16 L 555.21,698.73 L 560.11,699.00 L 556.30,702.09 L 557.56,706.82 L 553.45,704.16 L 549.34,706.82 L 550.60,702.09 L 546.79,699.00 L 551.69,698.73 Z" fill="url(#gold-bright-static)" />
          <path d="M 246.55,694.16 L 246.55,694.16 L 248.31,698.73 L 253.21,699.00 L 249.40,702.09 L 250.66,706.82 L 246.55,704.16 L 242.44,706.82 L 243.70,702.09 L 239.89,699.00 L 244.79,698.73 Z" fill="url(#gold-bright-static)" />
          {/* Stamp year */}
          <text x="400" y="768" fontSize="19" fontWeight="800" className="badge-heading gold-text" textAnchor="middle" letterSpacing="4.5">2026</text>
        </svg>

        {/* Not Verified Overlay */}
        {playerData.validationStatus !== "verified" && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-3 z-20 backdrop-blur-xs rounded-xl">
            <div className="text-[#E31B23] font-black uppercase text-[10px] tracking-widest mb-1.5 flex items-center gap-1">
              <span>⚠️</span> Pending Validation
            </div>
            <p className="text-[8px] text-gray-400 max-w-45 text-center">
              A coach must validate your CV details from the academy dashboard to unlock your certificate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
