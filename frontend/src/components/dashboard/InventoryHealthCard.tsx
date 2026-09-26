import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ShieldCheck, AlertTriangle, AlertCircle, ArrowRight, PackagePlus } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export const InventoryHealthCard: React.FC = () => {
  const { products, healthyPercent, lowStockPercent, outOfStockPercent, setActiveRoute, setActiveModal } = useInventory();

  const totalSKUs = products.length;
  const healthyCount = products.filter((p) => p.status === 'healthy').length;
  const lowCount = products.filter((p) => p.status === 'low-stock').length;
  const outCount = products.filter((p) => p.status === 'out-of-stock').length;

  const data = [
    { name: 'Healthy', value: healthyPercent || 0, count: healthyCount, color: '#49C98A' },
    { name: 'Low Stock', value: lowStockPercent || 0, count: lowCount, color: '#F5A623' },
    { name: 'Out of Stock', value: outOfStockPercent || 0, count: outCount, color: '#E87883' },
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EEE8E3]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#242633] tracking-tight">
              Catalog Stock Health
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#DBBA95]/30 text-[#855e30]">
              SKU Buffer
            </span>
          </div>
          <p className="text-xs text-[#686878]">
            Catalog availability breakdown based on safety reorder thresholds
          </p>
        </div>
        <div
          className={`p-2 rounded-2xl ${
            outCount > 0
              ? 'bg-rose-500/15 text-rose-600'
              : lowCount > 0
              ? 'bg-amber-500/15 text-amber-600'
              : 'bg-[#49C98A]/15 text-[#1a7e4e]'
          }`}
        >
          {outCount > 0 ? (
            <AlertCircle className="w-4 h-4" />
          ) : lowCount > 0 ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
        </div>
      </div>

      {/* Donut Chart with Centered Metric */}
      <div className="relative h-48 sm:h-52 my-3 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any, item: any) => [
                `${item.payload.count} of ${totalSKUs} SKUs (${value}%)`,
                name,
              ]}
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
          <span className="text-3xl font-extrabold text-[#242633] tracking-tight leading-none">
            {healthyPercent}%
          </span>
          <span className="text-[11px] font-bold text-[#686878] uppercase tracking-wider mt-1">
            Healthy SKUs
          </span>
          <span className="text-[10px] text-[#686878]/80 font-medium">
            {healthyCount} of {totalSKUs} items
          </span>
        </div>
      </div>

      {/* Legend & Count Breakdown - Interactive Click to View Catalog */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#EEE8E3]">
        <button
          onClick={() => setActiveRoute('products')}
          title="Click to view all healthy products"
          className="p-2.5 rounded-2xl bg-[#49C98A]/10 border border-[#49C98A]/20 text-center hover:bg-[#49C98A]/20 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#49C98A]" />
            <span className="text-[11px] font-semibold text-[#1a7e4e]">Healthy</span>
          </div>
          <p className="text-base font-bold text-[#242633] text-center">{healthyPercent}%</p>
          <p className="text-[10px] text-[#686878] text-center">{healthyCount} SKUs</p>
        </button>

        <button
          onClick={() => setActiveRoute('products')}
          title="Click to inspect items at or below reorder level"
          className="p-2.5 rounded-2xl bg-[#F5A623]/10 border border-[#F5A623]/20 text-center hover:bg-[#F5A623]/20 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
            <span className="text-[11px] font-semibold text-[#a86500]">Low Stock</span>
          </div>
          <p className="text-base font-bold text-[#242633] text-center">{lowStockPercent}%</p>
          <p className="text-[10px] text-[#686878] text-center">{lowCount} SKUs</p>
        </button>

        <button
          onClick={() => setActiveRoute('products')}
          title="Click to inspect out-of-stock items"
          className="p-2.5 rounded-2xl bg-[#E87883]/10 border border-[#E87883]/20 text-center hover:bg-[#E87883]/20 transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#E87883]" />
            <span className="text-[11px] font-semibold text-[#b92c3a]">Out of Stock</span>
          </div>
          <p className="text-base font-bold text-[#242633] text-center">{outOfStockPercent}%</p>
          <p className="text-[10px] text-[#686878] text-center">{outCount} SKUs</p>
        </button>
      </div>

      {/* Actionable Replenishment Prompt */}
      {outCount > 0 ? (
        <div className="mt-3.5 p-3 rounded-2xl bg-rose-50 border border-rose-200/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping" />
            <p className="text-xs text-rose-900 font-medium truncate">
              <span className="font-bold">{outCount} SKU{outCount > 1 ? 's' : ''} depleted</span> · Inbound PO recommended
            </p>
          </div>
          <button
            onClick={() => setActiveModal('receipt')}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#DBBA95] via-[#FABED7] to-[#F07BAF] text-[#242633] text-xs font-bold flex items-center gap-1 shadow-xs hover:opacity-90 transition-opacity shrink-0"
          >
            <PackagePlus className="w-3.5 h-3.5" />
            <span>Restock</span>
          </button>
        </div>
      ) : lowCount > 0 ? (
        <div className="mt-3.5 p-3 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <p className="text-xs text-amber-900 font-medium truncate">
              <span className="font-bold">{lowCount} SKU{lowCount > 1 ? 's' : ''} near safety threshold</span>
            </p>
          </div>
          <button
            onClick={() => setActiveRoute('products')}
            className="px-2.5 py-1 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-amber-700 transition-colors shrink-0"
          >
            <span>Review</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="mt-3.5 p-2.5 rounded-2xl bg-[#49C98A]/10 border border-[#49C98A]/20 flex items-center justify-between text-xs text-[#1a7e4e]">
          <span className="font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% SKU availability buffer maintained
          </span>
          <button
            onClick={() => setActiveRoute('products')}
            className="text-[11px] font-bold underline hover:opacity-80"
          >
            View SKUs
          </button>
        </div>
      )}
    </div>
  );
};
