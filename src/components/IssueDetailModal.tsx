import { Modal } from './Modal';
import { CategoryBadge, PriorityBadge, StatusBadge } from './Badges';
import { CategoryIcon } from './CategoryIcon';
import { formatDate, formatTime } from './IssueCard';
import type { Issue, IssueStatus } from '@/types';
import { getStatusMeta } from '@/data';
import {
  MapPin,
  User,
  Clock,
  Building2,
  Wrench,
  CheckCircle2,
  CircleDot,
  FileText,
  Camera,
} from 'lucide-react';

const STATUS_ORDER: IssueStatus[] = ['Reported', 'In Progress', 'Resolved'];

export function IssueDetailModal({
  issue,
  onClose,
}: {
  issue: Issue | null;
  onClose: () => void;
}) {
  if (!issue) return null;

  const currentStep = STATUS_ORDER.indexOf(issue.status);

  return (
    <Modal open={!!issue} onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
            <CategoryIcon category={issue.category} className="w-6 h-6 text-navy-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-mono font-semibold text-navy-400">{issue.id}</span>
            <h2 className="text-xl font-extrabold text-navy-900 leading-snug mt-0.5">{issue.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <CategoryBadge category={issue.category} />
              <PriorityBadge priority={issue.priority} />
              <StatusBadge status={issue.status} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-navy-700 mb-2">Description</h3>
          <p className="text-sm text-navy-600 leading-relaxed bg-navy-50 rounded-xl p-4">{issue.description}</p>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <MetaItem icon={MapPin} label="Location" value={issue.location} />
          <MetaItem icon={Building2} label="Category" value={issue.category} />
          <MetaItem icon={User} label="Reported by" value={issue.reportedBy} />
          <MetaItem icon={Clock} label="Reported on" value={`${formatDate(issue.reportedAt)} at ${formatTime(issue.reportedAt)}`} />
          <MetaItem icon={Wrench} label="Assigned team" value={issue.assignedTeam} />
          <MetaItem icon={Clock} label="Last updated" value={`${formatDate(issue.updatedAt)} at ${formatTime(issue.updatedAt)}`} />
        </div>

        {/* Photo placeholder */}
        {issue.photoUrl && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-navy-700 mb-2">Attached photo</h3>
            <div className="rounded-xl overflow-hidden border border-navy-100">
              <img src={issue.photoUrl} alt={issue.title} className="w-full max-h-64 object-cover" />
            </div>
          </div>
        )}

        {/* Status timeline */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-navy-700 mb-4">Status Timeline</h3>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-navy-100" />
            <div
              className="absolute left-[19px] top-2 w-0.5 bg-teal-500 transition-all duration-500"
              style={{ height: `calc(${(currentStep / (STATUS_ORDER.length - 1)) * 100}% - 8px)` }}
            />
            {STATUS_ORDER.map((status, idx) => {
              const event = issue.timeline.find((t) => t.status === status);
              const isDone = idx <= currentStep;
              const isCurrent = idx === currentStep;
              const meta = getStatusMeta(status);
              return (
                <div key={status} className="relative flex items-start gap-4 pb-6 last:pb-0">
                  <div
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isDone ? 'bg-teal-500 text-white' : 'bg-navy-100 text-navy-400'
                    } ${isCurrent && !isDone ? 'animate-pulse-ring' : ''}`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <CircleDot className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 pt-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isDone ? 'text-navy-900' : 'text-navy-400'}`}>
                        {status}
                      </span>
                      {isCurrent && (
                        <span className={`badge ${meta.bg} ${meta.text}`}>Current</span>
                      )}
                    </div>
                    {event ? (
                      <>
                        <p className="text-xs text-navy-500 mt-0.5">
                          {formatDate(event.timestamp)} at {formatTime(event.timestamp)} · {event.actor}
                        </p>
                        {event.note && (
                          <p className="text-sm text-navy-600 mt-1.5 bg-navy-50 rounded-lg p-2.5">
                            {event.note}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-xs text-navy-400 mt-0.5 italic">Awaiting update</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution notes */}
        {issue.resolutionNotes && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-emerald-800">Resolution Notes</h3>
            </div>
            <p className="text-sm text-emerald-700 leading-relaxed">{issue.resolutionNotes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-navy-50">
      <Icon className="w-4 h-4 text-navy-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-navy-400">{label}</p>
        <p className="text-sm font-semibold text-navy-800 truncate">{value}</p>
      </div>
    </div>
  );
}
