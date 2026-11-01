import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showSlogan = false,
  variant = 'dark'
}) => {
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const textColor = variant === 'light' ? 'text-white' : 'text-[#123B70]';
  const sloganColor = variant === 'light' ? 'text-blue-200' : 'text-slate-500';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Emblem: Book + Graduation Cap + Checkmark */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSize}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Shield / Rounded base */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="url(#logo_grad_primary)"
          />

          {/* Open Book Base */}
          <path
            d="M24 72C32 68 42 68 50 71C58 68 68 68 76 72V44C68 40 58 40 50 43C42 40 32 40 24 44V72Z"
            fill="white"
            fillOpacity="0.95"
          />
          {/* Book Spine Center Line */}
          <path
            d="M50 43V71"
            stroke="#123B70"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Graduation Cap top diamond */}
          <path
            d="M50 20L76 32L50 42L24 32L50 20Z"
            fill="#FBBF24"
          />
          <path
            d="M76 32V42"
            stroke="#D97706"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="76" cy="43" r="2.5" fill="#D97706" />

          {/* Success Checkmark overlay on book */}
          <circle cx="68" cy="64" r="14" fill="#16A36A" />
          <path
            d="M62 64L66 68L74 60"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <defs>
            <linearGradient id="logo_grad_primary" x1="4" y1="4" x2="96" y2="96" gradientUnits="userSpaceOnUse">
              <stop stopColor="#123B70" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-tight">
          <span className={`font-black tracking-tight ${titleSize} ${textColor}`}>
            OnVienChuc<span className="text-[#2563EB]">BacNinh</span>
          </span>
        </div>
        {showSlogan && (
          <span className={`text-xs font-medium tracking-wide ${sloganColor}`}>
            Ôn tập thông minh – Tự tin thi tuyển
          </span>
        )}
      </div>
    </div>
  );
};
