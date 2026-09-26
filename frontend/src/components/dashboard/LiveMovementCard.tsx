import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  ArrowRight,
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';
import { MovementType } from '../../types/inventory';

export const LiveMovementCard: React.FC = () => {
  const { movements, setActiveRoute } = useInventory();

  // Take the most recent movements
  const recentMovements = movements.slice(0, 5);

  const getMovementConfig = (type: MovementType) => {
    switch (type) {
      case 'Receipt':
        return {
          icon: ArrowDownLeft,
          bgColor: 'bg-[#DBBA95]/30',
          textColor: 'text-[#855e30]',
          borderColor: 'border-[#DBBA95]/50',
          label: 'RECEIVED',
        };
      case 'Delivery':
        return {
          icon: ArrowUpRight,
          bgColor: 'bg-[#D0BCE1]/30',
          textColor: 'text-[#5e4479]',
          borderColor: 'border-[#D0BCE1]/50',
          label: 'DELIVERED',
        };
      case 'Transfer':
        return {
          icon: ArrowLeftRight,
          bgColor: 'bg-[#F1D7C8]/60',
          textColor: 'text-[#8a5538]',
          borderColor: 'border-[#F1D7C8]/80',
          label: 'TRANSFERRED',
        };
      case 'Adjustment':
        return {
          icon: SlidersHorizontal,
          bgColor: 'bg-[#E7DDF1]',
          textColor: 'text-[#553b6f]',
          borderColor: 'border-[#D0BCE1]/70',
          label: 'ADJUSTED',
        };
      default:
        return {
          icon: History,
          bgColor: 'bg-[#EEE8E3]',
          textColor: 'text-[#686878]',
          borderColor: 'border-[#DDD5CE]',
          label: 'MOVEMENT',
        };
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#EEE8E3]">
        <div>
          <h3 className="text-base font-bold text-[#242633] tracking-tight">
            Live Movement Ledger
          </h3>
          <p className="text-xs text-[#686878]">Real-time chronological events</p>
        </div>
        <button
          onClick={() => setActiveRoute('move-history')}
          className="text-xs font-semibold text-[#855e30] hover:text-[#242633] flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Vertical Activity Timeline */}
      <div className="py-4 space-y-4 relative flex-1">
        {/* Continuous Connecting Line */}
        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-[#EEE8E3] z-0" />

        {recentMovements.map((move) => {
          const config = getMovementConfig(move.movementType);
          const Icon = config.icon;
          const isPositive = move.quantityChange > 0;
          const sign = isPositive ? '+' : '';

          return (
            <div key={move.id} className="relative z-10 flex items-start gap-3.5 group">
              {/* Event Icon Bubble */}
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${config.borderColor} ${config.bgColor} shadow-xs transition-transform group-hover:scale-105`}
              >
                <Icon className={`w-4 h-4 ${config.textColor}`} />
              </div>

              {/* Event Details */}
              <div className="flex-1 min-w-0 bg-white/50 hover:bg-white/80 p-3 rounded-2xl border border-white/60 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded-md tracking-wider ${config.bgColor} ${config.textColor}`}
                    >
                      {config.label}
                    </span>
                    <span className="text-xs font-bold text-[#242633] truncate">
                      {move.productName}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold shrink-0 ${
                      move.movementType === 'Adjustment'
                        ? move.quantityChange >= 0
                          ? 'text-[#1a7e4e]'
                          : 'text-[#b92c3a]'
                        : move.movementType === 'Delivery'
                        ? 'text-[#b92c3a]'
                        : 'text-[#1a7e4e]'
                    }`}
                  >
                    {sign}
                    {move.quantityChange.toLocaleString()}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] text-[#686878]">
                  <span className="truncate">
                    {move.location} {move.toLocation ? `→ ${move.toLocation}` : ''}
                  </span>
                  <span className="shrink-0">{move.date.split(' ')[1] || move.date}</span>
                </div>

                {move.notes && (
                  <p className="mt-1 text-[10px] text-[#686878]/90 italic truncate">
                    {move.notes} · by {move.user}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-3 border-t border-[#EEE8E3] flex items-center justify-between text-xs text-[#686878]">
        <span>Ledger Status</span>
        <span className="font-semibold text-[#1a7e4e] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#49C98A]" />
          Audit Trail Synced
        </span>
      </div>
    </div>
  );
};
