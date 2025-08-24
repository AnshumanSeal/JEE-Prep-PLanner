import React from 'react';

export const CoffeeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75C6.75 5.64543 7.64543 4.75 8.75 4.75H15.25C16.3546 4.75 17.25 5.64543 17.25 6.75V11.25C17.25 12.3546 16.3546 13.25 15.25 13.25H8.75C7.64543 13.25 6.75 12.3546 6.75 11.25V6.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.25H20.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 13.25V17.25C17.25 18.3546 16.3546 19.25 15.25 19.25H8.75C7.64543 19.25 6.75 18.3546 6.75 17.25V13.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.75V2.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 4.75V3.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 4.75V3.25" />
    </svg>
);
