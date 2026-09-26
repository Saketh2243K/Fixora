import {
  Droplets,
  Zap,
  Armchair,
  Sparkles,
  Wifi,
  ShieldAlert,
  PackageOpen,
  type LucideIcon,
} from 'lucide-react';
import type { IssueCategory } from '@/types';

const ICON_MAP: Record<string, LucideIcon> = {
  Droplets,
  Zap,
  Armchair,
  Sparkles,
  Wifi,
  ShieldAlert,
  PackageOpen,
};

export function CategoryIcon({
  category,
  className,
}: {
  category: IssueCategory;
  className?: string;
}) {
  const Icon = ICON_MAP[category] ?? PackageOpen;
  return <Icon className={className} />;
}
