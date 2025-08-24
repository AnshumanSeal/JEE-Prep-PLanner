import React from 'react';

export const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 1-4.874-1.971 2.25 2.25 0 0 1-1.328-2.135V6.75a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 6.75v7.894a2.25 2.25 0 0 1-1.328 2.135 9.75 9.75 0 0 1-4.874 1.971Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75v3.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 5.25V3.75" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25V3.75" />
    </svg>
);
