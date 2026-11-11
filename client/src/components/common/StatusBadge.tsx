import React from 'react';
import { Clock, UserCheck, Truck, CheckCircle2, AlertTriangle, Cpu, Apple, Recycle, ShieldAlert, Layers } from 'lucide-react';
import { ReportStatus, WasteType } from '../../types';

interface StatusBadgeProps {
  status: ReportStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm';

  switch (status) {
    case 'PENDING':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5" />
          Pending
        </span>
      );
    case 'ASSIGNED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300/60 dark:border-blue-800 ${sizeClasses}`}>
          <UserCheck className="w-3.5 h-3.5" />
          Assigned
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300/60 dark:border-purple-800 ${sizeClasses}`}>
          <Truck className="w-3.5 h-3.5 animate-pulse" />
          In Progress
        </span>
      );
    case 'COLLECTED':
      return (
        <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Collected
        </span>
      );
    default:
      return null;
  }
};

interface WasteBadgeProps {
  wasteType: WasteType;
  size?: 'sm' | 'md';
}

export const WasteBadge: React.FC<WasteBadgeProps> = ({ wasteType, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  switch (wasteType) {
    case 'ORGANIC':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-lime-100 text-lime-800 dark:bg-lime-950/60 dark:text-lime-300 ${sizeClasses}`}>
          <Apple className="w-3 h-3" />
          Organic
        </span>
      );
    case 'PLASTIC':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ${sizeClasses}`}>
          <Recycle className="w-3 h-3" />
          Plastic
        </span>
      );
    case 'METAL':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 ${sizeClasses}`}>
          <AlertTriangle className="w-3 h-3" />
          Metal
        </span>
      );
    case 'E-WASTE':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 ${sizeClasses}`}>
          <Cpu className="w-3 h-3" />
          E-Waste
        </span>
      );
    case 'HAZARDOUS':
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 ${sizeClasses}`}>
          <ShieldAlert className="w-3 h-3" />
          Hazardous
        </span>
      );
    case 'MIXED':
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 ${sizeClasses}`}>
          <Layers className="w-3 h-3" />
          Mixed
        </span>
      );
  }
};

