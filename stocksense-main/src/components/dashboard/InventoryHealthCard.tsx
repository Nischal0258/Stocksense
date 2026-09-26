import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const InventoryHealthCard: React.FC = () => {
  const { products, healthyPercent, lowStockPercent, outOfStockPercent } = useInventory();

  const healthyCount = products.filter((p) => p.status === 'healthy').length;
  const lowCount = products.filter((p) => p.status === 'low-stock').length;
  const outCount = products.filter((p) => p.status === 'out-of-stock').length;

  const data = [
    { name: 'Healthy', value: healthyPercent || 82, count: healthyCount, color: '#49C98A' },
    { name: 'Low Stock', value: lowStockPercent || 12, count: lowCount, color: '#F5A623' },
    { name: 'Out of Stock', value: outOfStockPercent || 6, count: outCount, color: '#E87883' },
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-[#EEE8E3]">
        <div>
          <h3 className="text-base font-bold text-[#242633] tracking-tight">
            Inventory Health
          </h3>
          <p className="text-xs text-[#686878]">Real-time SKU stock integrity</p>
        </div>
        <div className="p-2 rounded-2xl bg-[#49C98A]/15 text-[#1a7e4e]">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>

      {/* Donut Chart with Centered Metric */}
      <div className="relative h-48 sm:h-52 my-3 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any) => [`${value}% of catalog`, name]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                boxShadow: '0 10px 25px -5px rgba(36, 38, 51, 0.1)',
                fontSize: '12px',
                color: '#242633',
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-[#242633] tracking-tight">
            {healthyPercent}%
          </span>
          <span className="text-[11px] font-semibold text-[#686878] uppercase tracking-wider">
            Healthy
          </span>
        </div>
      </div>

      {/* Legend & Count Breakdown */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#EEE8E3]">
        <div className="p-2.5 rounded-2xl bg-[#49C98A]/10 border border-[#49C98A]/20 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#49C98A]" />
            <span className="text-[11px] font-semibold text-[#1a7e4e]">Healthy</span>
          </div>
          <p className="text-base font-bold text-[#242633]">{healthyPercent}%</p>
          <p className="text-[10px] text-[#686878]">{healthyCount} SKUs</p>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/20 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
            <span className="text-[11px] font-semibold text-[#a86500]">Low Stock</span>
          </div>
          <p className="text-base font-bold text-[#242633]">{lowStockPercent}%</p>
          <p className="text-[10px] text-[#686878]">{lowCount} SKUs</p>
        </div>

        <div className="p-2.5 rounded-2xl bg-[#E87883]/10 border border-[#E87883]/20 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#E87883]" />
            <span className="text-[11px] font-semibold text-[#b92c3a]">Out of Stock</span>
          </div>
          <p className="text-base font-bold text-[#242633]">{outOfStockPercent}%</p>
          <p className="text-[10px] text-[#686878]">{outCount} SKUs</p>
        </div>
      </div>
    </div>
  );
};
