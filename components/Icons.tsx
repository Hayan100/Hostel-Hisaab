import React from "react";

interface IconProps {
  size?: number;
  className?: string;
}

export function PlusIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <line x1="10" y1="3" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ListIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <line x1="7" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="7" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="7" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="4" cy="5" r="1.2" fill="currentColor" />
      <circle cx="4" cy="10" r="1.2" fill="currentColor" />
      <circle cx="4" cy="15" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function CalculatorIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="5.5" y="4.5" width="9" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6.5" cy="11" r="1" fill="currentColor" />
      <circle cx="10" cy="11" r="1" fill="currentColor" />
      <circle cx="13.5" cy="11" r="1" fill="currentColor" />
      <circle cx="6.5" cy="14.5" r="1" fill="currentColor" />
      <circle cx="10" cy="14.5" r="1" fill="currentColor" />
      <circle cx="13.5" cy="14.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function EditIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <path
        d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="9.5" y1="4.5" x2="11.5" y2="6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4.5 4l.5 9h6l.5-9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="8" y1="6.5" x2="8" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="6" y1="6.5" x2="6.3" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="10" y1="6.5" x2="9.7" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DownloadIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
      <line x1="9" y1="2" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polyline
        points="5,8 9,12 13,8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="3" y1="16" x2="15" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function RefreshIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
      <path
        d="M3 9a6 6 0 016-6 6 6 0 014.5 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 9a6 6 0 01-6 6 6 6 0 01-4.5-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <polyline
        points="13.5,3 13.5,7 9.5,7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <polyline
        points="4.5,15 4.5,11 8.5,11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polyline
        points="9,4 14,8 9,12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function LedgerIcon({ size = 32, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="5" y="2" width="22" height="28" rx="2" fill="#0D9488" />
      <rect x="5" y="2" width="5" height="28" rx="1" fill="#0A6B63" />
      <line x1="13" y1="9" x2="23" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="13" x2="23" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="17" x2="23" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="21" x2="19" y2="21" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="8" x2="7" y2="24" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
    </svg>
  );
}

export function UserIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HistoryIcon({ size = 20, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.8" />
      <polyline
        points="10,6 10,10 13,12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function LogoutIcon({ size = 18, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" className={className}>
      <path
        d="M7 3H4a1 1 0 00-1 1v10a1 1 0 001 1h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <line x1="8" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <polyline
        points="12,6 15,9 12,12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16, className = "" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
      <polyline
        points="3,6 8,11 13,6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
