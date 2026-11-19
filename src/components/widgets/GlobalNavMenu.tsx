import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { SidebarItemObject } from '@/components/widgets/LineSidebar';

export type PageView =
  | 'landing'
  | 'dashboard'
  | 'scrollytelling'
  | 'scrollytelling-two-pillar'
  | 'directory'
  | 'bus-stop-scrollytelling'
  | 'bus-stop-analysis'
  | 'bus-stop-directory'
  | 'bus-stop-graphs';

interface GlobalNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: PageView) => void;
  onViewDirectory?: () => void;
  activeItemIndex?: number;
}

export interface NavMenuItem extends SidebarItemObject {
  page?: PageView;
  track?: 'route' | 'bus-stop';
}

export const STRUCTURED_MENU_ITEMS: NavMenuItem[] = [
  { label: 'Landing Page', page: 'landing' },
  { label: 'Route Equity Scorecard', code: '1.0', isHeader: true, track: 'route' },
  { label: 'Explain the Route Equity Scorecard to Me!', code: '1.1', indent: true, page: 'scrollytelling', track: 'route' },
  { label: 'Route Equity Scorecard Dashboard', code: '1.2', indent: true, page: 'dashboard', track: 'route' },
  { label: 'Route Directory', code: '1.3', indent: true, page: 'directory', track: 'route' },
  { label: 'Bus Stop Equity Scorecard', code: '2.0', isHeader: true, track: 'bus-stop' },
  { label: 'Explain the Bus Stop Equity Dashboard to Me!', code: '2.1', indent: true, page: 'bus-stop-scrollytelling', track: 'bus-stop' },
  { label: 'Bus Stop Equity Dashboard', code: '2.2', indent: true, page: 'bus-stop-analysis', track: 'bus-stop' },
  { label: 'Bus Stop Directory', code: '2.3', indent: true, page: 'bus-stop-directory', track: 'bus-stop' },
  { label: 'Bus Stop Graphs and Figures', code: '2.4', indent: true, page: 'bus-stop-graphs', track: 'bus-stop' },
];

export const MENU_ITEMS = STRUCTURED_MENU_ITEMS.map((i) => i.label);

export const GlobalNavMenu: React.FC<GlobalNavMenuProps> = ({
  isOpen,
  onClose,
  onNavigate,
  activeItemIndex = 0,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNavigate = (page?: PageView) => {
    if (!page) return;
    onClose();
    onNavigate?.(page);
  };

  const legacyIndexMap: Record<number, number> = {
    0: 0, // Landing Page
    1: 2, // Explain the Route Equity Scorecard to Me! (1.1)
    2: 3, // Route Equity Scorecard Dashboard (1.2)
    3: 4, // Route Directory (1.3)
    4: 6, // Explain the Bus Stop Equity Dashboard to Me! (2.1)
    5: 7, // Bus Stop Equity Dashboard (2.2)
    6: 8, // Bus Stop Directory (2.3)
    7: 9, // Bus Stop Graphs and Figures (2.4)
  };

  const computedActiveIndex =
    activeItemIndex in legacyIndexMap && activeItemIndex < 8
      ? legacyIndexMap[activeItemIndex]
      : activeItemIndex;

  const landingItem = STRUCTURED_MENU_ITEMS[0];
  const routeHeader = STRUCTURED_MENU_ITEMS[1];
  const routeItems = STRUCTURED_MENU_ITEMS.slice(2, 5);
  const busStopHeader = STRUCTURED_MENU_ITEMS[5];
  const busStopItems = STRUCTURED_MENU_ITEMS.slice(6, 10);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs transition-opacity duration-200 flex items-start justify-start p-4 sm:p-6 md:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="ETS Equity Scorecard Navigation"
    >
      {/* Dual-Track Transit Timetable Menu */}
      <nav
        className="bg-white border border-slate-200 shadow-lg rounded-xl p-5 sm:p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-150 relative max-h-[88vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5 mb-4">
          <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-900">
            ETS EQUITY SCORECARD
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            title="Close Menu"
            aria-label="Close Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Landing Page */}
        <button
          type="button"
          onClick={() => handleNavigate(landingItem.page)}
          className={`w-full text-left px-3 py-2 rounded-r-md text-sm transition-colors flex items-center justify-between border-l-2 ${
            computedActiveIndex === 0
              ? 'border-slate-900 bg-slate-100/90 text-slate-950 font-semibold'
              : 'border-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-medium'
          }`}
        >
          <span>{landingItem.label}</span>
        </button>

        {/* Hairline Divider */}
        <hr className="border-t border-slate-200/80 my-3.5" />

        {/* Track 1.0: Routes (Deep Navy #1E3A8A) */}
        <section aria-labelledby="nav-track-routes">
          <div
            id="nav-track-routes"
            className="border-l-2 border-[#1E3A8A] pl-2.5 py-0.5 mb-2 flex items-baseline gap-2.5 select-none"
          >
            <span className="font-mono tabular-nums text-[11px] font-bold text-[#1E3A8A]">
              {routeHeader.code}
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#1E3A8A]">
              {routeHeader.label}
            </span>
          </div>

          <ul className="space-y-0.5">
            {routeItems.map((item, offset) => {
              const itemIndex = 2 + offset;
              const isActive = computedActiveIndex === itemIndex;
              return (
                <li key={item.code}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.page)}
                    className={`w-full text-left pl-3 pr-2.5 py-2 rounded-r-md text-[13px] leading-snug transition-colors flex items-baseline gap-2.5 border-l-2 ${
                      isActive
                        ? 'border-[#1E3A8A] bg-blue-50/80 text-[#1E3A8A] font-semibold'
                        : 'border-transparent text-slate-700 hover:bg-slate-50 hover:text-[#1E3A8A] font-medium'
                    }`}
                  >
                    <span
                      className={`font-mono tabular-nums text-[11px] shrink-0 ${
                        isActive ? 'text-[#1E3A8A] font-bold' : 'text-slate-400'
                      }`}
                    >
                      {item.code}
                    </span>
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Hairline Divider */}
        <hr className="border-t border-slate-200/80 my-3.5" />

        {/* Track 2.0: Bus Stops (Deep Emerald #047857) */}
        <section aria-labelledby="nav-track-bus-stops">
          <div
            id="nav-track-bus-stops"
            className="border-l-2 border-[#047857] pl-2.5 py-0.5 mb-2 flex items-baseline gap-2.5 select-none"
          >
            <span className="font-mono tabular-nums text-[11px] font-bold text-[#047857]">
              {busStopHeader.code}
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#047857]">
              {busStopHeader.label}
            </span>
          </div>

          <ul className="space-y-0.5">
            {busStopItems.map((item, offset) => {
              const itemIndex = 6 + offset;
              const isActive = computedActiveIndex === itemIndex;
              return (
                <li key={item.code}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.page)}
                    className={`w-full text-left pl-3 pr-2.5 py-2 rounded-r-md text-[13px] leading-snug transition-colors flex items-baseline gap-2.5 border-l-2 ${
                      isActive
                        ? 'border-[#047857] bg-emerald-50/80 text-[#047857] font-semibold'
                        : 'border-transparent text-slate-700 hover:bg-emerald-50/40 hover:text-[#047857] font-medium'
                    }`}
                  >
                    <span
                      className={`font-mono tabular-nums text-[11px] shrink-0 ${
                        isActive ? 'text-[#047857] font-bold' : 'text-slate-400'
                      }`}
                    >
                      {item.code}
                    </span>
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </nav>
    </div>
  );
};
