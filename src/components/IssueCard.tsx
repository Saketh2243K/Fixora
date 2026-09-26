import type { Issue } from '@/types';
import { CategoryBadge, PriorityBadge, StatusBadge } from './Badges';
import { CategoryIcon } from './CategoryIcon';
import { MapPin, Clock, User } from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function IssueCard({
  issue,
  onClick,
}: {
  issue: Issue;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card card-hover p-5 text-left w-full group animate-slide-up"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-navy-50 group-hover:bg-teal-50 flex items-center justify-center shrink-0 transition-colors">
          <CategoryIcon category={issue.category} className="w-5 h-5 text-navy-600 group-hover:text-teal-600 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-navy-400">{issue.id}</span>
          </div>
          <h3 className="font-bold text-navy-900 text-sm leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
            {issue.title}
          </h3>
          <p className="text-sm text-navy-500 mt-1 line-clamp-2">{issue.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <CategoryBadge category={issue.category} />
            <PriorityBadge priority={issue.priority} />
            <StatusBadge status={issue.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-navy-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {issue.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDate(issue.reportedAt)}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {issue.reportedBy}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export { formatDate, formatTime };
