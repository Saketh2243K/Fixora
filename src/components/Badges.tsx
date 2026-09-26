import type { IssueCategory, IssuePriority, IssueStatus } from '@/types';
import { getCategoryMeta, getPriorityMeta, getStatusMeta } from '@/data';
import { CategoryIcon } from './CategoryIcon';

export function CategoryBadge({ category }: { category: IssueCategory }) {
  const meta = getCategoryMeta(category);
  return (
    <span className={`badge ${meta.bg} ${meta.text}`}>
      <CategoryIcon category={category} className="w-3.5 h-3.5" />
      {category}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  const meta = getPriorityMeta(priority);
  return (
    <span className={`badge ${meta.bg} ${meta.text}`}>
      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: IssueStatus }) {
  const meta = getStatusMeta(status);
  return (
    <span className={`badge ${meta.bg} ${meta.text}`}>
      <span className={`w-2 h-2 rounded-full ${meta.dot} ${status !== 'Resolved' ? 'animate-pulse' : ''}`} />
      {status}
    </span>
  );
}
