import React, { useState } from 'react';
import { RouteWaterfall } from './RouteWaterfall';
import { GlobalNavMenu, PageView } from './widgets/GlobalNavMenu';
import { Menu, ChevronDown, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onTellMeHow?: () => void;
  onJumpIn?: () => void;
  onNavigate?: (page: PageView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onTellMeHow, onJumpIn, onNavigate }) => {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);

  const handleGo = (page: PageView) => {
    if (onNavigate) {
      onNavigate(page);
    } else if (page === 'dashboard' && onJumpIn) {
      onJumpIn();
    } else if (page === 'scrollytelling' && onTellMeHow) {
      onTellMeHow();
    }
  };

  return (
    <main className="min-h-screen w-full flex-grow flex flex-col items-center justify-center px-4 md:px-8 py-12 md:py-20 relative overflow-hidden bg-slate-50 font-sans">
      {/* Standardized Global Navigation Menu */}
      <GlobalNavMenu
        isOpen={isNavMenuOpen}
        onClose={() => setIsNavMenuOpen(false)}
        onNavigate={onNavigate}
        activeItemIndex={0}
      />

      {/* Top Left Menu Trigger */}
      <div className="absolute top-6 left-6 z-40">
        <button
          onClick={() => setIsNavMenuOpen(!isNavMenuOpen)}
          className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-white/90 hover:bg-white backdrop-blur-md rounded-xl border border-[#E2E8F0] transition-all shadow-sm flex items-center gap-2"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isNavMenuOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Route Waterfall Animated Background */}
      <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <RouteWaterfall opacity={0.42} />
      </div>

      {/* Frosted Porcelain Wayfinding Card */}
      <div className="relative z-10 w-full max-w-4xl mx-auto bg-white/85 backdrop-blur-md border border-[#E2E8F0] rounded-xl shadow-[0_20px_50px_-20px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.95)] transition-all duration-300">
        <div className="w-full px-7 py-10 sm:px-12 sm:py-14 md:px-16 md:py-16 flex flex-col items-center justify-center text-center">
          <div className="flex flex-col items-center w-full gap-8">
            <header className="flex flex-col gap-2 w-full justify-center">
              <h1
                className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.08] text-center w-full pb-1 select-none"
                style={{
                  color: 'rgba(15, 23, 42, 0.76)',
                  textShadow:
                    '0 2px 0 rgba(255, 255, 255, 0.96), 0 -1px 2px rgba(15, 23, 42, 0.28)',
                }}
              >
                <span className="whitespace-nowrap">ETS Transit Equity</span>
                <br />
                Scorecard
              </h1>
            </header>

            {/* Two-Column Themed Action Area */}
            <div className="w-full max-w-3xl mt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7 items-start">
                {/* Column 1: Route Equity (Deep Navy #1E3A8A) */}
                <div className="flex flex-col items-center w-full">
                  <button
                    onClick={() => handleGo('dashboard')}
                    className="w-full py-4 px-6 rounded-xl bg-[#1E3A8A] hover:bg-[#172e6e] text-white font-bold text-base sm:text-lg shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-[#1E3A8A]/25 active:scale-[0.99] text-center"
                  >
                    Route Equity Dashboard
                  </button>
                  <button
                    onClick={() => handleGo('scrollytelling')}
                    className="mt-3 text-sm font-semibold text-[#1E3A8A] hover:text-[#172e6e] hover:underline underline-offset-4 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 rounded-md py-1 px-2 inline-flex items-center gap-1.5 group"
                  >
                    <span>Explain the Route Equity Scorecard</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </button>
                </div>

                {/* Column 2: Bus Stop Equity (Deep Emerald #047857) */}
                <div className="flex flex-col items-center w-full">
                  <button
                    onClick={() => handleGo('bus-stop-analysis')}
                    className="w-full py-4 px-6 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-base sm:text-lg shadow-sm hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-[#047857]/25 active:scale-[0.99] text-center"
                  >
                    Bus Stop Equity Dashboard
                  </button>
                  <button
                    onClick={() => handleGo('bus-stop-scrollytelling')}
                    className="mt-3 text-sm font-semibold text-[#047857] hover:text-[#065f46] hover:underline underline-offset-4 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#047857]/30 rounded-md py-1 px-2 inline-flex items-center gap-1.5 group"
                  >
                    <span>Explain the Bus Stop Equity Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
