import React from 'react';

export default function Logo({ theme = 'light', height = '45px', style = {} }) {
  // Dual-theme color mapping
  const textColor = theme === 'dark' ? '#FFFFFF' : '#1A1A1A';
  const orangeColor = '#FF6B00';

  return (
    <svg 
      viewBox="0 0 250 120" 
      style={{ height: height, width: 'auto', display: 'block', ...style }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ROW 1: "10000" + Monitor Graphic */}
      {/* "10000" Text */}
      <text 
        x="10" 
        y="42" 
        fontSize="44" 
        fontWeight="800" 
        fontFamily="'Outfit', -apple-system, sans-serif" 
        letterSpacing="-1.5"
      >
        <tspan fill={orangeColor}>1</tspan>
        <tspan fill={textColor}>0000</tspan>
      </text>

      {/* MONITOR GRAPHIC (Positioned to the right of 10000) */}
      <g transform="translate(142, 6)">
        {/* Monitor Base */}
        <path d="M12,40 L28,40 L25,43 L15,43 Z" fill={textColor} />
        
        {/* Monitor Stem */}
        <rect x="18" y="32" width="4" height="8" fill={textColor} />
        
        {/* Monitor Outer Frame */}
        <rect x="2" y="8" width="36" height="25" rx="3" fill={textColor} />
        
        {/* Monitor Inner Screen (Orange) */}
        <rect x="5" y="11" width="30" height="19" rx="1.5" fill="#FF8E3C" />
        
        {/* Code Sign "</>" inside screen */}
        <text 
          x="20" 
          y="25" 
          fontSize="12" 
          fontWeight="900" 
          fontFamily="'Outfit', -apple-system, sans-serif" 
          textAnchor="middle" 
          fill="#1A1A1A"
        >
          &lt;/&gt;
        </text>

        {/* Graduation Cap on top-right of monitor */}
        <g transform="translate(23, -2)">
          {/* Diamond cap top */}
          <polygon points="12,4 23,8 12,12 1,8" fill={textColor} />
          
          {/* Skull cap under diamond */}
          <path d="M5,9.5 L5,12 C5,13.5 19,13.5 19,12 L19,9.5" fill={textColor} />
          
          {/* Tassel */}
          <path d="M18,9 L21,15 L22.5,15" stroke={textColor} strokeWidth="1" fill="none" />
          <circle cx="22.5" cy="15.5" r="0.8" fill={textColor} />
        </g>

        {/* TM Symbol */}
        <text 
          x="41" 
          y="12" 
          fontSize="5" 
          fontWeight="bold" 
          fontFamily="'Outfit', -apple-system, sans-serif" 
          fill={textColor}
        >
          TM
        </text>
      </g>

      {/* ROW 2: "C{O}DERS" */}
      <text 
        x="10" 
        y="85" 
        fontSize="44" 
        fontWeight="800" 
        fontFamily="'Outfit', -apple-system, sans-serif" 
        letterSpacing="2"
      >
        <tspan fill={textColor}>C</tspan>
        <tspan fill={orangeColor}>{"{"}</tspan>
        <tspan fill={orangeColor}>O</tspan>
        <tspan fill={orangeColor}>{"}"}</tspan>
        <tspan fill={textColor}>DERS</tspan>
      </text>

      {/* ROW 3: Tagline "Right path for a Bright Career." */}
      <text 
        x="11" 
        y="110" 
        fontSize="11.5" 
        fontWeight="600" 
        fontFamily="'Outfit', -apple-system, sans-serif" 
        letterSpacing="0.2"
      >
        <tspan fill={orangeColor}>Right</tspan>
        <tspan fill={textColor}> path for a </tspan>
        <tspan fill={orangeColor}>Bright</tspan>
        <tspan fill={textColor}> Career.</tspan>
      </text>
    </svg>
  );
}
