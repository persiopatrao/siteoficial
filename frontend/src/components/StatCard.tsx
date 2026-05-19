import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'primary' | 'emerald' | 'orange' | 'red';
  trend?: {
    value: number;
    up: boolean;
  };
}

const colorMap = {
  primary: {
    bg: 'bg-blue-50',
    icon: 'text-primary-600',
    border: 'border-blue-200',
  },
  emerald: {
    bg: 'bg-emerald-50',
    icon: 'text-emerald-600',
    border: 'border-emerald-200',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200',
  },
};

export default function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className={`card ${colors.bg} border-2 ${colors.border}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
        </div>
        <div className={`${colors.bg} p-3 rounded-lg`}>
          <Icon className={`${colors.icon}`} size={24} />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <span className={trend.up ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
            {trend.up ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-slate-500">vs período anterior</span>
        </div>
      )}
    </div>
  );
}
