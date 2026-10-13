export default function Logo({ theme = 'light', height = '46px', style = {} }) {
  const isDark = theme === 'dark';
  const primaryColor = '#2563EB'; // Royal Blue
  const accentColor = '#059669';  // Emerald Green
  const titleColor = isDark ? '#FFFFFF' : '#0F172A'; // Slate 900 or White
  const subtitleColor = isDark ? '#94A3B8' : '#64748B'; // Slate 500

  return (
    <svg 
      viewBox="0 0 320 80" 
      style={{ height: height, width: 'auto', display: 'block', ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* BRAND ICON: Graduation Cap & Career Growth Compass */}
      <g transform="translate(10, 10)">
        {/* Rounded Icon Background */}
        <rect 
          x="0" 
          y="0" 
          width="60" 
          height="60" 
          rx="14" 
          fill="url(#cpa-gradient)" 
        />
        
        {/* Graduation Cap Top */}
        <polygon 
          points="30,16 48,24 30,32 12,24" 
          fill="#FFFFFF" 
        />
        
        {/* Cap Base */}
        <path 
          d="M18,27 L18,34 C18,37.5 42,37.5 42,34 L42,27" 
          fill="#FFFFFF" 
          opacity="0.95" 
        />
        
        {/* Tassel & Growth Star */}
        <path 
          d="M44,25 L47,33 L48.5,33" 
          stroke="#FCD34D" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          fill="none" 
        />
        <circle cx="48.5" cy="33.5" r="1.5" fill="#FCD34D" />

        {/* Upward Growth Arrow underneath */}
        <path 
          d="M22,46 L30,40 L38,46" 
          stroke="#FFFFFF" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          fill="none" 
        />
      </g>

      {/* GRADIENT DEFINITIONS */}
      <defs>
        <linearGradient id="cpa-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* BRAND TEXT: Main Title */}
      <text 
        x="82" 
        y="36" 
        fontSize="21" 
        fontWeight="800" 
        fontFamily="'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" 
        letterSpacing="-0.5"
        fill={titleColor}
      >
        Campus <tspan fill={primaryColor}>Placement</tspan>
      </text>

      {/* BRAND TEXT: Subtitle / Product Identity */}
      <text 
        x="82" 
        y="56" 
        fontSize="12.5" 
        fontWeight="600" 
        fontFamily="'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" 
        letterSpacing="1.2"
        fill={accentColor}
      >
        ASSISTANCE <tspan fill={subtitleColor} fontWeight="500" letterSpacing="0.3">| PORTAL</tspan>
      </text>
    </svg>
  );
}
