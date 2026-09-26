import React from 'react';
import { Warehouse, Building2, HardDrive } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const WarehousePulseCard: React.FC = () => {
  const { locations } = useInventory();

  // Focus on top warehouses or full list
  const primaryLocations = locations.slice(0, 4);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#EEE8E3]">
        <div>
          <h3 className="text-base font-bold text-[#242633] tracking-tight">
            Warehouse Pulse
          </h3>
          <p className="text-xs text-[#686878]">Capacity utilization & zone loads</p>
        </div>
        <div className="p-2 rounded-2xl bg-[#EAA2C8]/20 text-[#9c356f]">
          <Warehouse className="w-4 h-4" />
        </div>
      </div>

      {/* Capacity Rows */}
      <div className="py-3 space-y-4 flex-1 flex flex-col justify-center">
        {primaryLocations.map((loc, idx) => {
          // Alternating beige & rose accents
          const isBeige = idx % 2 === 0;
          const barColor = isBeige
            ? 'from-[#DBBA95] to-[#F8C6D8]'
            : 'from-[#EAA2C8] to-[#F8C6D8]';
          const badgeStyle = isBeige
            ? 'bg-[#DBBA95]/20 text-[#855e30]'
            : 'bg-[#EAA2C8]/20 text-[#9c356f]';

          return (
            <div key={loc.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#242633]">{loc.name}</span>
                  <span className="text-[10px] text-[#686878] hidden sm:inline">
                    ({loc.type})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#242633]">
                    {loc.used.toLocaleString()}u
                  </span>
                  <span className="text-[#686878]">/ {loc.capacity.toLocaleString()}u</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeStyle}`}>
                    {loc.utilizationPercent}%
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="h-2.5 w-full bg-[#EEE8E3] rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                  style={{ width: `${Math.min(100, loc.utilizationPercent)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="pt-3 border-t border-[#EEE8E3] flex items-center justify-between text-xs text-[#686878]">
        <span>Aggregated Warehouse Load</span>
        <span className="font-bold text-[#242633]">73.8% Optimal</span>
      </div>
    </div>
  );
};
