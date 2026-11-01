export function EditorialIdentityCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
      {/* =====================================================================
          CARD 1: FULL-STACK WEB ARCHITECTURE (Matte Obsidian Workstation & Brushed Steel)
      ===================================================================== */}
      <a
        href="#projects"
        className="bw-card aspect-[3/3.9] group cursor-pointer shadow-2xl block"
        aria-label="Full-Stack Web Architecture — Next.js & Cloud Systems"
      >
        <svg
          viewBox="0 0 400 520"
          className="editorial-art w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="studioWebBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#DCDCDC" />
              <stop offset="52%" stopColor="#EFEFEF" />
              <stop offset="100%" stopColor="#CFCFCF" />
            </linearGradient>
            <linearGradient id="obsidianChassis" x1="0%" y1="0%" x2="100%" y2="85%">
              <stop offset="0%" stopColor="#2E2E2E" />
              <stop offset="35%" stopColor="#141414" />
              <stop offset="75%" stopColor="#090909" />
              <stop offset="100%" stopColor="#1F1F1F" />
            </linearGradient>
            <linearGradient id="brushedAluminum1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#CCCCCC" />
              <stop offset="75%" stopColor="#737373" />
              <stop offset="100%" stopColor="#2B2B2B" />
            </linearGradient>
            <linearGradient id="screenGlass1" x1="0%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#1A1A1A" />
              <stop offset="55%" stopColor="#0C0C0C" />
              <stop offset="100%" stopColor="#050505" />
            </linearGradient>
          </defs>

          {/* Bright Monochrome Studio Backdrop */}
          <rect width="400" height="520" fill="url(#studioWebBg)" />

          {/* Diagonal Architectural Brushed Steel Beam */}
          <line x1="-20" y1="78" x2="420" y2="148" stroke="#1E1E1E" strokeWidth="12" />
          <line x1="-20" y1="75" x2="420" y2="145" stroke="#8C8C8C" strokeWidth="2.5" />

          {/* Architectural Concrete Plinth Base */}
          <polygon points="36,520 74,394 332,394 368,520" fill="#222222" />
          <polygon points="74,394 332,394 312,374 96,374" fill="#9E9E9E" />
          <polygon points="36,520 74,394 195,394 176,520" fill="#363636" />

          {/* Cast Contact Shadow on Plinth */}
          <ellipse cx="202" cy="384" rx="116" ry="11" fill="#050505" opacity="0.82" />

          {/* Floating Matte-Obsidian Developer Workstation Display */}
          <g transform="translate(200, 232) rotate(-5) translate(-200, -232)">
            {/* Outer Metallic Bezel Rim */}
            <rect
              x="54"
              y="112"
              width="292"
              height="196"
              rx="16"
              fill="url(#brushedAluminum1)"
            />
            {/* Obsidian Display Frame */}
            <rect
              x="57"
              y="115"
              width="286"
              height="190"
              rx="14"
              fill="url(#screenGlass1)"
            />

            {/* Top Studio Window Chrome Dots */}
            <circle cx="75" cy="131" r="3" fill="#7A7A7A" />
            <circle cx="85" cy="131" r="3" fill="#525252" />
            <circle cx="95" cy="131" r="3" fill="#3D3D3D" />
            <rect x="148" y="127" width="104" height="8" rx="4" fill="#1C1C1C" />

            {/* High-Contrast Monochrome Bento Wireframe Architecture */}
            {/* Hero Block inside Screen */}
            <rect x="73" y="146" width="162" height="88" rx="9" fill="#1F1F1F" stroke="#363636" strokeWidth="1.2" />
            <rect x="85" y="160" width="52" height="6" rx="3" fill="#8C8C8C" />
            <rect x="85" y="173" width="118" height="14" rx="3" fill="#EFEFEF" />
            <rect x="85" y="193" width="90" height="12" rx="3" fill="#CFCFCF" />
            <rect x="85" y="214" width="46" height="10" rx="5" fill="#FFFFFF" />

            {/* Right Code / Metrics Column inside Screen */}
            <rect x="245" y="146" width="82" height="142" rx="9" fill="#151515" stroke="#2D2D2D" strokeWidth="1.2" />
            <line x1="257" y1="164" x2="304" y2="164" stroke="#BDBDBD" strokeWidth="3" strokeLinecap="round" />
            <line x1="257" y1="176" x2="314" y2="176" stroke="#666666" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="265" y1="188" x2="308" y2="188" stroke="#8C8C8C" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="265" y1="200" x2="296" y2="200" stroke="#525252" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="257" y1="212" x2="312" y2="212" stroke="#7A7A7A" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="286" cy="254" r="19" fill="none" stroke="#DCDCDC" strokeWidth="3.5" strokeDasharray="76 28" />

            {/* Bottom 2 Bento Sub-cards inside Screen */}
            <rect x="73" y="242" width="77" height="46" rx="8" fill="#181818" stroke="#2E2E2E" strokeWidth="1" />
            <rect x="84" y="255" width="38" height="6" rx="3" fill="#D4D4D4" />
            <rect x="84" y="267" width="54" height="5" rx="2.5" fill="#666666" />

            <rect x="158" y="242" width="77" height="46" rx="8" fill="#242424" stroke="#3D3D3D" strokeWidth="1" />
            <rect x="169" y="255" width="44" height="6" rx="3" fill="#FFFFFF" />
            <rect x="169" y="267" width="50" height="5" rx="2.5" fill="#8A8A8A" />

            {/* Diagonal Glossy Studio Glass Specular Reflection */}
            <polygon
              points="68,116 168,116 108,304 58,304"
              fill="#FFFFFF"
              opacity="0.08"
            />

            {/* Sleek Aluminum Laptop Base Deck */}
            <path
              d="M36 308 L364 308 C362 318, 352 324, 336 324 L64 324 C48 324, 38 318, 36 308 Z"
              fill="url(#obsidianChassis)"
            />
            <rect x="166" y="308" width="68" height="4" rx="2" fill="#9E9E9E" />
          </g>
        </svg>

        {/* Bottom Editorial Caption Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-end justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-tight block mb-0.5">
              <span className="text-[#FF5510]">#</span>
              <span className="text-white">01</span>
              <span className="text-white/60 font-medium ml-1.5 uppercase tracking-wider text-[10px]">
                Web Systems
              </span>
            </span>
            <p className="text-white font-bold text-[15px] tracking-[-0.02em]">
              Next.js &amp; Cloud Architecture
            </p>
          </div>
        </div>
      </a>

      {/* =====================================================================
          CARD 2: MOBILE APP / APK ENGINEERING (Sculptural Flagship Device on Stone)
      ===================================================================== */}
      <a
        href="#projects"
        className="bw-card aspect-[3/3.9] group cursor-pointer shadow-2xl block"
        aria-label="Cross-Platform Mobile App APK — Flutter Engineering"
      >
        <svg
          viewBox="0 0 400 520"
          className="editorial-art w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="studioMobileBg" cx="48%" cy="36%" r="72%">
              <stop offset="0%" stopColor="#F0F0F0" />
              <stop offset="62%" stopColor="#CACACA" />
              <stop offset="100%" stopColor="#969696" />
            </radialGradient>
            <linearGradient id="titaniumFrame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#BDBDBD" />
              <stop offset="68%" stopColor="#4A4A4A" />
              <stop offset="100%" stopColor="#1A1A1A" />
            </linearGradient>
            <linearGradient id="obsidianPhone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1B1B1B" />
              <stop offset="50%" stopColor="#0B0B0B" />
              <stop offset="100%" stopColor="#040404" />
            </linearGradient>
            <linearGradient id="stoneBlock" x1="0%" y1="0%" x2="100%" y2="85%">
              <stop offset="0%" stopColor="#C4C4C4" />
              <stop offset="48%" stopColor="#6E6E6E" />
              <stop offset="100%" stopColor="#1C1C1C" />
            </linearGradient>
          </defs>

          {/* Studio Backdrop */}
          <rect width="400" height="520" fill="url(#studioMobileBg)" />

          {/* Background Secondary Monolith Slab */}
          <polygon points="-10,415 88,334 176,386 164,520 -10,520" fill="#2A2A2A" />
          <polygon points="88,334 176,386 124,412 42,378" fill="#5C5C5C" opacity="0.65" />

          {/* Precision Flagship Mobile Device (Tilted +7 deg) */}
          <g transform="translate(206, 224) rotate(7) translate(-206, -224)">
            {/* Side Titanium Depth Edge */}
            <rect x="122" y="54" width="166" height="328" rx="30" fill="#262626" />
            {/* Brushed Titanium Bezel */}
            <rect
              x="116"
              y="52"
              width="164"
              height="326"
              rx="29"
              fill="url(#titaniumFrame)"
            />
            {/* Deep Obsidian OLED Display */}
            <rect
              x="121"
              y="57"
              width="154"
              height="316"
              rx="25"
              fill="url(#obsidianPhone)"
            />

            {/* Dynamic Island Pill */}
            <rect x="176" y="69" width="44" height="11" rx="5.5" fill="#000000" stroke="#262626" strokeWidth="1" />

            {/* Crisp Monochrome Mobile UI Cards inside OLED */}
            <rect x="135" y="96" width="126" height="76" rx="14" fill="#1F1F1F" stroke="#3A3A3A" strokeWidth="1.2" />
            <circle cx="155" cy="118" r="10" fill="#EAEAEA" />
            <rect x="173" y="111" width="64" height="6" rx="3" fill="#FFFFFF" />
            <rect x="173" y="122" width="42" height="5" rx="2.5" fill="#8A8A8A" />
            <rect x="147" y="144" width="102" height="16" rx="8" fill="#DEDEDE" />

            {/* Middle Dual Metric Tiles */}
            <rect x="135" y="182" width="59" height="68" rx="12" fill="#161616" stroke="#2D2D2D" strokeWidth="1" />
            <rect x="146" y="196" width="24" height="12" rx="3" fill="#FFFFFF" />
            <rect x="146" y="216" width="36" height="5" rx="2.5" fill="#737373" />
            <rect x="146" y="226" width="28" height="5" rx="2.5" fill="#4D4D4D" />

            <rect x="202" y="182" width="59" height="68" rx="12" fill="#222222" stroke="#3D3D3D" strokeWidth="1" />
            <circle cx="231" cy="210" r="14" fill="none" stroke="#EFEFEF" strokeWidth="3" strokeDasharray="62 24" />
            <rect x="214" y="233" width="34" height="5" rx="2.5" fill="#9E9E9E" />

            {/* Bottom Navigation Sheet */}
            <rect x="135" y="260" width="126" height="84" rx="14" fill="#151515" stroke="#2B2B2B" strokeWidth="1" />
            <line x1="149" y1="280" x2="225" y2="280" stroke="#D4D4D4" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="149" y1="295" x2="242" y2="295" stroke="#6E6E6E" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="149" y1="308" x2="206" y2="308" stroke="#525252" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="149" y="322" width="52" height="10" rx="5" fill="#FFFFFF" />

            {/* Home Indicator */}
            <rect x="174" y="359" width="48" height="3.5" rx="1.75" fill="#8C8C8C" />

            {/* Glossy Studio Softbox Reflection */}
            <path
              d="M126 62 L182 62 L142 368 L126 368 Z"
              fill="#FFFFFF"
              opacity="0.11"
            />
          </g>

          {/* Foreground Sculptural Chiseled Stone Pedestal */}
          <g>
            <ellipse cx="204" cy="382" rx="76" ry="12" fill="#050505" opacity="0.85" />
            <polygon points="56,520 122,380 256,376 348,406 402,520" fill="url(#stoneBlock)" />
            <polygon points="122,380 256,376 286,436 154,446" fill="#BDBDBD" />
            <polygon points="256,376 348,406 402,520 286,436" fill="#4F4F4F" />
            <polygon points="56,520 122,380 154,446 98,520" fill="#828282" />
          </g>
        </svg>

        {/* Bottom Editorial Caption Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-end justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-tight block mb-0.5">
              <span className="text-[#FF5510]">#</span>
              <span className="text-white">02</span>
              <span className="text-white/60 font-medium ml-1.5 uppercase tracking-wider text-[10px]">
                Mobile APK
              </span>
            </span>
            <p className="text-white font-bold text-[15px] tracking-[-0.02em]">
              Flutter &amp; Native Experience
            </p>
          </div>
        </div>
      </a>

      {/* =====================================================================
          CARD 3: AI SYSTEMS & INFORMATICS ENGINEERING (Obsidian Neural Monolith)
      ===================================================================== */}
      <a
        href="#services"
        className="bw-card aspect-[3/3.9] group cursor-pointer shadow-2xl block"
        aria-label="AI Integration & Informatics Engineering UNESA '24"
      >
        <svg
          viewBox="0 0 400 520"
          className="editorial-art w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="studioAiBg" x1="0%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#E4E4E4" />
              <stop offset="58%" stopColor="#F4F4F4" />
              <stop offset="100%" stopColor="#CCCCCC" />
            </linearGradient>
            <linearGradient id="monolithCore" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#080808" />
              <stop offset="22%" stopColor="#3B3B3B" />
              <stop offset="40%" stopColor="#101010" />
              <stop offset="82%" stopColor="#060606" />
              <stop offset="94%" stopColor="#2E2E2E" />
              <stop offset="100%" stopColor="#0A0A0A" />
            </linearGradient>
            <linearGradient id="chromeRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#B8B8B8" />
              <stop offset="100%" stopColor="#262626" />
            </linearGradient>
          </defs>

          {/* Studio Light Gray Backdrop */}
          <rect width="400" height="520" fill="url(#studioAiBg)" />

          {/* Subtle Precision Architectural Orbit Rings in Studio Space */}
          <ellipse
            cx="200"
            cy="214"
            rx="136"
            ry="44"
            fill="none"
            stroke="#8C8C8C"
            strokeWidth="1.5"
            transform="rotate(-22 200 214)"
          />
          <ellipse
            cx="200"
            cy="214"
            rx="124"
            ry="36"
            fill="none"
            stroke="#242424"
            strokeWidth="2.2"
            strokeDasharray="14 8"
            transform="rotate(24 200 214)"
          />

          {/* Central Obsidian AI Compute Cylinder / Monolith */}
          <g transform="translate(200, 215) rotate(-3) translate(-200, -215)">
            {/* Top Cap Rim */}
            <rect x="132" y="82" width="136" height="256" rx="22" fill="url(#monolithCore)" />

            {/* Brushed Aluminum Precision Cooling Fins */}
            <g stroke="#525252" strokeWidth="1.8" opacity="0.85">
              <line x1="146" y1="98" x2="254" y2="98" />
              <line x1="146" y1="108" x2="254" y2="108" />
              <line x1="146" y1="118" x2="254" y2="118" />
            </g>

            {/* Center Glowing Brushed-Silver Neural Core Lens */}
            <circle cx="200" cy="198" r="46" fill="url(#chromeRing)" />
            <circle cx="200" cy="198" r="37" fill="#0B0B0B" />
            <circle cx="200" cy="198" r="24" fill="none" stroke="#E6E6E6" strokeWidth="2.5" />
            <circle cx="200" cy="198" r="10" fill="#FFFFFF" />
            {/* Radial Tensor Nodes */}
            <line x1="200" y1="164" x2="200" y2="174" stroke="#BDBDBD" strokeWidth="2" />
            <line x1="200" y1="222" x2="200" y2="232" stroke="#BDBDBD" strokeWidth="2" />
            <line x1="166" y1="198" x2="176" y2="198" stroke="#BDBDBD" strokeWidth="2" />
            <line x1="224" y1="198" x2="234" y2="198" stroke="#BDBDBD" strokeWidth="2" />

            {/* Minimalist White Spec Plate on Monolith */}
            <rect x="148" y="264" width="104" height="46" rx="6" fill="#EAEAEA" />
            <rect x="160" y="277" width="46" height="5" rx="2.5" fill="#141414" />
            <rect x="160" y="288" width="76" height="4" rx="2" fill="#6E6E6E" />
            <rect x="160" y="297" width="58" height="4" rx="2" fill="#8C8C8C" />

            {/* Studio Specular Highlight Strip */}
            <rect x="144" y="88" width="14" height="244" rx="7" fill="#FFFFFF" opacity="0.18" />
          </g>

          {/* Architectural Stepped Dark Concrete Pedestal */}
          <ellipse cx="200" cy="348" rx="84" ry="11" fill="#050505" opacity="0.85" />
          <polygon points="88,348 312,348 334,386 66,386" fill="#B5B5B5" />
          <polygon points="66,386 334,386 356,520 44,520" fill="#1C1C1C" />
          <polygon points="66,386 204,386 188,520 44,520" fill="#2E2E2E" />
        </svg>

        {/* Bottom Editorial Caption Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent flex items-end justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-tight block mb-0.5">
              <span className="text-[#FF5510]">#</span>
              <span className="text-white">03</span>
              <span className="text-white/60 font-medium ml-1.5 uppercase tracking-wider text-[10px]">
                AI &amp; Engineering
              </span>
            </span>
            <p className="text-white font-bold text-[15px] tracking-[-0.02em]">
              Intelligent Systems &amp; UNESA &apos;24
            </p>
          </div>
        </div>
      </a>
    </div>
  );
}
