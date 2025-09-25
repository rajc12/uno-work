import { SVGProps } from "react";

export const SkipSymbol = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" />
        <line x1="25" y1="75" x2="75" y2="25" stroke="currentColor" strokeWidth="12" />
    </svg>
);

export const ReverseSymbol = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M75 35L60 20M75 35L90 20M75 35V80H25" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M25 65L40 80M25 65L10 80" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

export const DrawTwoSymbol = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="20" width="40" height="60" rx="5" stroke="currentColor" strokeWidth="8"/>
        <rect x="40" y="30" width="40" height="60" rx="5" stroke="currentColor" strokeWidth="8" fill="rgba(0,0,0,0.2)" />
    </svg>
);

export const WildSymbol = (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 0C100 55.2285 55.2285 100 0 100V0H100Z" fill="#F44336"/>
        <path d="M200 100C144.772 100 100 144.772 100 200H200V100Z" fill="#4CAF50"/>
        <path d="M100 200C100 144.772 144.772 100 200 100V200H100Z" fill="#FFEB3B"/>
        <path d="M0 100C55.2285 100 100 55.2285 100 0V100H0Z" fill="#2196F3"/>
    </svg>
);


export const DrawFourSymbol = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M100 0C100 55.2285 55.2285 100 0 100V0H100Z" fill="#2196F3" />
    <path d="M200 100C144.772 100 100 144.772 100 200H200V100Z" fill="#FFEB3B" />
    <path d="M100 200C100 144.772 144.772 100 200 100V200H100Z" fill="#4CAF50" />
    <path d="M0 100C55.2285 100 100 55.2285 100 0V100H0Z" fill="#F44336" />
    <text x="100" y="125" fontFamily="sans-serif" fontSize="60" fill="white" textAnchor="middle" fontWeight="bold">+4</text>
  </svg>
);
