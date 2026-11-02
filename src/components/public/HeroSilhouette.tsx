import Image from 'next/image';

interface HeroSilhouetteProps {
  heroImageUrl?: string | null;
  altText?: string;
}

export function HeroSilhouette({
  heroImageUrl,
  altText = 'Faqih Rafasha Argandhi — Software Developer',
}: HeroSilhouetteProps) {
  if (heroImageUrl) {
    return (
      <div className="absolute inset-0 flex justify-center items-end pointer-events-none z-[2] overflow-hidden">
        <div className="relative w-full max-w-[680px] h-[88%] opacity-90 mix-blend-luminosity">
          <Image
            src={heroImageUrl}
            alt={altText}
            fill
            priority
            className="object-contain object-bottom"
            sizes="(max-width: 768px) 100vw, 680px"
            unoptimized={
              heroImageUrl.startsWith('data:') || heroImageUrl.endsWith('.svg')
            }
          />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#170503] via-[#9E1B06]/35 to-transparent mix-blend-multiply"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 flex justify-center items-end pointer-events-none z-[2] overflow-hidden"
      aria-hidden="true"
    >
      <div className="relative w-full max-w-[540px] sm:max-w-[680px] lg:max-w-[800px] h-[80%] sm:h-[86%] lg:h-[90%] flex items-end justify-center">
        {/* High-contrast studio silhouette portrait using pure radial/linear gradients (0ms SVG blur filter cost) */}
        <svg
          viewBox="0 -60 800 740"
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMax meet"
        >
          <defs>
            <radialGradient id="headBacklight" cx="44%" cy="42%" r="50%">
              <stop offset="0%" stopColor="#FF772B" stopOpacity="0.88" />
              <stop offset="38%" stopColor="#E33208" stopOpacity="0.5" />
              <stop offset="72%" stopColor="#6E1404" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#2D0703" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="faceRimLight" x1="0%" y1="0%" x2="100%" y2="85%">
              <stop offset="0%" stopColor="#FF8C42" />
              <stop offset="22%" stopColor="#D4380D" />
              <stop offset="52%" stopColor="#3D0C05" />
              <stop offset="85%" stopColor="#120402" />
            </linearGradient>

            <linearGradient id="coatGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#290804" />
              <stop offset="40%" stopColor="#130402" />
              <stop offset="100%" stopColor="#070201" />
            </linearGradient>
          </defs>

          {/* Backlight Aura */}
          <circle cx="360" cy="280" r="295" fill="url(#headBacklight)" />

          {/* Voluminous Textured Hair Silhouette */}
          <g fill="#1A0503">
            <g stroke="#B82906" strokeWidth="1.5" fill="#230603" opacity="0.92">
              <circle cx="385" cy="128" r="22" />
              <circle cx="412" cy="116" r="25" />
              <circle cx="445" cy="120" r="24" />
              <circle cx="474" cy="134" r="26" />
              <circle cx="502" cy="155" r="24" />
              <circle cx="518" cy="182" r="22" />
              <circle cx="362" cy="145" r="19" />
              <circle cx="348" cy="166" r="16" />
              <circle cx="526" cy="212" r="21" />
              <circle cx="524" cy="245" r="23" />
              <circle cx="512" cy="276" r="22" />
              <circle cx="496" cy="304" r="20" />
            </g>

            <path d="M368 132 C355 112, 382 96, 392 115" fill="none" stroke="#3A0B05" strokeWidth="4" strokeLinecap="round" />
            <path d="M402 108 C398 86, 428 84, 426 108" fill="none" stroke="#4D0F06" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M442 108 C452 86, 480 96, 466 118" fill="none" stroke="#3A0B05" strokeWidth="4" strokeLinecap="round" />
            <path d="M485 124 C508 108, 526 128, 504 145" fill="none" stroke="#2D0703" strokeWidth="4" strokeLinecap="round" />
            <path d="M518 164 C542 158, 548 184, 524 192" fill="none" stroke="#2D0703" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M530 205 C552 206, 550 232, 526 232" fill="none" stroke="#260603" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M522 256 C544 264, 536 288, 514 282" fill="none" stroke="#210502" strokeWidth="3.5" strokeLinecap="round" />

            <path
              d="M352 168 C345 130, 395 100, 445 108 C495 115, 538 160, 528 228 C520 278, 495 318, 462 332 C420 342, 378 290, 352 168 Z"
              fill="#140302"
            />
          </g>

          {/* Rim highlight along forehead, nose bridge, lips, and chin */}
          <path
            d="M352 174
               C336 184, 326 198, 322 210
               C305 212, 294 218, 291 226
               C290 232, 296 238, 303 243
               C295 249, 292 256, 296 263
               C292 269, 293 275, 299 280
               C295 292, 300 305, 314 312
               C332 320, 352 332, 354 366
               L335 430
               L468 445
               L458 325
               Z"
            fill="url(#faceRimLight)"
          />

          {/* Deep Shadow Core of Face & Neck */}
          <path
            d="M357 178
               C344 188, 334 202, 329 213
               C314 216, 302 221, 300 228
               C299 233, 306 239, 312 244
               C304 250, 302 257, 306 263
               C302 270, 303 275, 309 280
               C305 291, 309 302, 322 309
               C342 318, 362 330, 362 368
               L342 435
               L470 448
               L460 322
               Z"
            fill="#140302"
          />

          {/* Subtle Warm Highlight Cheekbone & Jawline */}
          <path
            d="M318 246 C332 256, 348 272, 356 296 C342 292, 325 285, 315 275 Z"
            fill="#6E1706"
            opacity="0.45"
          />

          {/* Subtle Eyebrow & Eye Profile Contour */}
          <g fill="none" strokeLinecap="round">
            <path
              d="M324 204 C332 200, 344 201, 354 206"
              stroke="#FF8C42"
              strokeWidth="2"
              opacity="0.85"
            />
            <path
              d="M316 216 C322 212, 330 213, 335 218"
              stroke="#FF772B"
              strokeWidth="1.6"
              opacity="0.85"
            />
          </g>

          {/* High-Collar Coat / Turtleneck Silhouette */}
          <path
            d="M335 398
               C345 385, 395 382, 462 396
               L478 442
               C495 495, 515 585, 535 680
               L282 680
               C295 595, 315 510, 338 450
               Z"
            fill="url(#coatGrad)"
          />

          {/* Subtle Warm Rim Light on Left Shoulder/Coat Edge */}
          <path
            d="M338 400 L342 445 C318 505, 298 595, 285 680"
            fill="none"
            stroke="#9E2408"
            strokeWidth="2.5"
            opacity="0.65"
          />
        </svg>
      </div>
    </div>
  );
}
