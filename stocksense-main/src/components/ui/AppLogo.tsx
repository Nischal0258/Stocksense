import React from 'react';

interface AppLogoProps {
  collapsed?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ collapsed = false, className = '' }) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic Geometric StockSense Mark */}
      <div className="relative w-10 h-10 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-br from-[#DBBA95] via-[#F1D7C8] to-[#D0BCE1] p-0.5 shrink-0 transition-transform duration-300 hover:scale-105">
        <div className="w-full h-full bg-[#242633] rounded-[14px] flex items-center justify-center overflow-hidden">
          <svg
            className="w-5 h-5 text-[#F7F3F0]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Box and Pulse Line */}
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        </div>
      </div>

      {!collapsed && (
        <div className="flex flex-col min-w-0 transition-opacity duration-200">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-lg tracking-tight text-[#242633] font-['Plus_Jakarta_Sans']">
              Stock<span className="text-[#DBBA95]">Sense</span>
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#686878]">
            Inventory Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
