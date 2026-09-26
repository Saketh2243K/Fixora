import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
  trend?: string;
}

export function StatCard({ label, value, icon: Icon, accent, iconBg, trend }: StatCardProps) {
  return (
    <div className="card card-hover p-5 animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-navy-500">{label}</p>
          <p className={`text-3xl font-extrabold mt-1 ${accent}`}>{value}</p>
          {trend && <p className="text-xs text-navy-400 mt-1">{trend}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return <div className="card p-5 h-[110px] animate-pulse bg-navy-50/50" />;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-navy-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-navy-400" />
      </div>
      <h3 className="text-lg font-bold text-navy-800">{title}</h3>
      <p className="text-sm text-navy-500 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
