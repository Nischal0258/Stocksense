import React from 'react';
import { StockStatus, ReceiptStatus, DeliveryStatus, MovementType } from '../../types/inventory';

type BadgeVariant = StockStatus | ReceiptStatus | DeliveryStatus | MovementType | string;

interface StatusBadgeProps {
  status: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'sm',
  className = '',
}) => {
  const norm = (status || '').toLowerCase().trim();

  let label = status;
  let bg = 'bg-[#EEE8E3] text-[#686878] border-[#E0D7D0]';
  let dotColor = 'bg-[#686878]';

  // Stock status
  if (norm === 'healthy') {
    label = 'Healthy';
    bg = 'bg-[#49C98A]/15 text-[#1a7e4e] border-[#49C98A]/30';
    dotColor = 'bg-[#49C98A]';
  } else if (norm === 'low-stock' || norm === 'low stock') {
    label = 'Low Stock';
    bg = 'bg-[#F5A623]/15 text-[#a86500] border-[#F5A623]/30';
    dotColor = 'bg-[#F5A623]';
  } else if (norm === 'out-of-stock' || norm === 'out of stock') {
    label = 'Out of Stock';
    bg = 'bg-[#E87883]/15 text-[#b92c3a] border-[#E87883]/30';
    dotColor = 'bg-[#E87883]';
  }
  // Order / Document statuses
  else if (norm === 'ready') {
    label = 'Ready';
    bg = 'bg-[#DBBA95]/20 text-[#855e30] border-[#DBBA95]/40';
    dotColor = 'bg-[#DBBA95]';
  } else if (norm === 'waiting' || norm === 'pending') {
    label = 'Waiting';
    bg = 'bg-[#D0BCE1]/25 text-[#5e4479] border-[#D0BCE1]/45';
    dotColor = 'bg-[#D0BCE1]';
  } else if (norm === 'done' || norm === 'completed') {
    label = 'Done';
    bg = 'bg-[#49C98A]/15 text-[#1a7e4e] border-[#49C98A]/30';
    dotColor = 'bg-[#49C98A]';
  } else if (norm === 'draft') {
    label = 'Draft';
    bg = 'bg-[#EEE8E3] text-[#686878] border-[#DDD5CE]';
    dotColor = 'bg-[#A09CA8]';
  } else if (norm === 'canceled' || norm === 'cancelled') {
    label = 'Canceled';
    bg = 'bg-stone-200/60 text-stone-600 border-stone-300';
    dotColor = 'bg-stone-400';
  }
  // Movement types
  else if (norm === 'receipt') {
    label = 'Receipt';
    bg = 'bg-[#DBBA95]/20 text-[#855e30] border-[#DBBA95]/40';
    dotColor = 'bg-[#DBBA95]';
  } else if (norm === 'delivery') {
    label = 'Delivery';
    bg = 'bg-[#D0BCE1]/25 text-[#5e4479] border-[#D0BCE1]/45';
    dotColor = 'bg-[#9674b0]';
  } else if (norm === 'transfer') {
    label = 'Transfer';
    bg = 'bg-[#F1D7C8]/50 text-[#8a5538] border-[#F1D7C8]/70';
    dotColor = 'bg-[#ca7a50]';
  } else if (norm === 'adjustment') {
    label = 'Adjustment';
    bg = 'bg-[#E7DDF1] text-[#553b6f] border-[#D0BCE1]/60';
    dotColor = 'bg-[#896aa3]';
  }

  const padding = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${padding} ${bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
};
