import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const MOVEMENT_DATA = [
  { day: 'Sep 19', inbound: 1420, outbound: 980 },
  { day: 'Sep 20', inbound: 2100, outbound: 1650 },
  { day: 'Sep 21', inbound: 1890, outbound: 2240 },
  { day: 'Sep 22', inbound: 3400, outbound: 1820 },
  { day: 'Sep 23', inbound: 2750, outbound: 2900 },
  { day: 'Sep 24', inbound: 1200, outbound: 890 },
  { day: 'Sep 25', inbound: 2450, outbound: 1430 },
];

export const StockMovementChart: React.FC = () => {
  const totalInbound = MOVEMENT_DATA.reduce((acc, d) => acc + d.inbound, 0);
  const totalOutbound = MOVEMENT_DATA.reduce((acc, d) => acc + d.outbound, 0);

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all hover:shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EEE8E3]">
        <div>
          <h3 className="text-base font-bold text-[#242633] tracking-tight">
            Stock Velocity Dynamics
          </h3>
          <p className="text-xs font-medium text-[#434553]">Inbound receipts vs outbound dispatch (Last 7 Days)</p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#DBBA95]" />
            <span className="text-[#855e30]">Inbound ({totalInbound.toLocaleString()}u)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#F07BAF]" />
            <span className="text-[#b32b69]">Outbound ({totalOutbound.toLocaleString()}u)</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full my-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={MOVEMENT_DATA}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Inbound Gradient: Warm Accent #DBBA95 */}
              <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DBBA95" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#DBBA95" stopOpacity={0.02} />
              </linearGradient>

              {/* Outbound Gradient: Luminous Rose Accent #F07BAF */}
              <linearGradient id="outboundGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F07BAF" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#F07BAF" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(215, 205, 195, 0.75)" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              dy={8}
              tick={{ fill: '#383A48', fontSize: 12, fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              dx={-6}
              tick={{ fill: '#383A48', fontSize: 12, fontWeight: 600 }}
              tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.85)',
                boxShadow: '0 12px 30px -10px rgba(36, 38, 51, 0.12)',
                fontSize: '12px',
                color: '#242633',
              }}
              formatter={(value: any, name: any) => [
                `${Number(value).toLocaleString()} units`,
                name === 'inbound' ? 'Inbound Receipt' : 'Outbound Dispatch',
              ]}
            />
            <Area
              type="monotone"
              dataKey="inbound"
              stroke="#DBBA95"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#inboundGrad)"
            />
            <Area
              type="monotone"
              dataKey="outbound"
              stroke="#F07BAF"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#outboundGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Insight */}
      <div className="pt-3 border-t border-[#EEE8E3] flex items-center justify-between text-xs text-[#434553]">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#DBBA95]" />
          <span className="font-medium">Net positive inventory accumulation (+3,230 units)</span>
        </div>
        <span className="font-bold text-[#242633]">Peak: Thu Sep 22</span>
      </div>
    </div>
  );
};
