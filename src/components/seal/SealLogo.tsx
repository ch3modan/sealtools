import React from 'react';
import Svg, { Ellipse, Circle, Path } from 'react-native-svg';

interface SealLogoProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

/**
 * Hand-crafted SVG seal logo — a round chubby seal silhouette.
 * Used as the app's branding logo (top-left, splash, etc.)
 */
export function SealLogo({ size = 48, color = '#7EC8E3', accentColor = '#E0E0E0' }: SealLogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {/* Body — big round chubby shape */}
      <Ellipse cx="50" cy="58" rx="36" ry="30" fill={color} />
      {/* Head */}
      <Circle cx="50" cy="32" r="22" fill={color} />
      {/* Left eye */}
      <Circle cx="42" cy="28" r="3" fill={accentColor} />
      <Circle cx="42" cy="28" r="1.5" fill="#1A1A2E" />
      {/* Right eye */}
      <Circle cx="58" cy="28" r="3" fill={accentColor} />
      <Circle cx="58" cy="28" r="1.5" fill="#1A1A2E" />
      {/* Nose */}
      <Ellipse cx="50" cy="34" rx="4" ry="2.5" fill="#1A1A2E" />
      {/* Whiskers left */}
      <Path d="M38 34 L25 30" stroke={accentColor} strokeWidth="1" strokeLinecap="round" />
      <Path d="M38 36 L24 36" stroke={accentColor} strokeWidth="1" strokeLinecap="round" />
      {/* Whiskers right */}
      <Path d="M62 34 L75 30" stroke={accentColor} strokeWidth="1" strokeLinecap="round" />
      <Path d="M62 36 L76 36" stroke={accentColor} strokeWidth="1" strokeLinecap="round" />
      {/* Left flipper */}
      <Ellipse cx="22" cy="62" rx="10" ry="6" fill={color} transform="rotate(-25 22 62)" />
      {/* Right flipper */}
      <Ellipse cx="78" cy="62" rx="10" ry="6" fill={color} transform="rotate(25 78 62)" />
      {/* Belly highlight */}
      <Ellipse cx="50" cy="62" rx="20" ry="16" fill={accentColor} opacity={0.2} />
    </Svg>
  );
}
