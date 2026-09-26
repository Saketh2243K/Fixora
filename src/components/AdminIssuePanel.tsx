import { useState } from 'react';
import { Modal } from './Modal';
import { CategoryBadge, PriorityBadge, StatusBadge } from './Badges';
import type { Issue, IssuePriority, IssueStatus, MaintenanceTeam } from '@/types';
import { MAINTENANCE_TEAMS, PRIORITIES, STATUSES } from '@/data';
import { Wrench, Send, Save, AlertCircle } from 'lucide-react';

export function AdminIssuePanel({
  issue,
  onClose,
  onUpdate,
}: {
  issue: Issue;
  onClose: () => void;
  onUpdate: (patch: Partial<Issue>) => void | Promise<void>;
}) {
  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [priority, setPriority] = useState<IssuePriority>(issue.priority);
  const [assignedTeam, setAssignedTeam] = useState<MaintenanceTeam>(issue.assignedTeam);
  const [resolutionNotes, setResolutionNotes] = useState(issue.resolutionNotes ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (saving) return;
    setError('');
    const patch: Partial<Issue> = { status, priority, assignedTeam };

    // Add resolution notes if status is Resolved or notes changed
    if (status === 'Resolved' && resolutionNotes.trim()) {
      patch.resolutionNotes = resolutionNotes.trim();
    } else if (resolutionNotes.trim() && resolutionNotes.trim() !== issue.resolutionNotes) {
      patch.resolutionNotes = resolutionNotes.trim();
    }

    // Validate: must assign a team if moving to In Progress
    if (status === 'In Progress' && assignedTeam === 'Unassigned') {
      setError('Please assign a maintenance team before marking as In Progress.');
      return;
    }

    // Validate: must add resolution notes if marking as Resolved
    if (status === 'Resolved' && !resolutionNotes.trim()) {
      setError('Please add resolution notes before marking as Resolved.');
      return;
    }

    // Build new timeline event if status changed
    if (status !== issue.status) {
      const newEvent = {
      status,
      timestamp: new Date().toISOString(),
      actor: 'Admin',
      note: status === 'Resolved' ? resolutionNotes.trim() : undefined,
    };
      patch.timeline = [...issue.timeline, newEvent];
    }

    setSaving(true);
    try {
      await onUpdate(patch);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={`Manage ${issue.id}`} maxWidth="max-w-2xl">
      <div className="p-6 space-y-5">
        {/* Issue summary */}
        <div className="rounded-xl bg-navy-50 p-4">
          <h3 className="font-bold text-navy-900 text-sm">{issue.title}</h3>
          <p className="text-xs text-navy-500 mt-1">{issue.location} · Reported by {issue.reportedBy}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <CategoryBadge category={issue.category} />
            <PriorityBadge priority={issue.priority} />
            <StatusBadge status={issue.status} />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-bold text-navy-700 mb-2">Update Status</label>
          <div className="grid grid-cols-3 gap-2">
            {STATUSES.map((s) => {
              const selected = status === s.name;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setStatus(s.name)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    selected
                      ? `${s.border ?? 'border-teal-500'} ${s.bg} ${s.text} shadow-glow`
                      : 'border-navy-100 bg-white text-navy-600 hover:border-navy-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-bold text-navy-700 mb-2">Change Priority</label>
          <div className="grid grid-cols-4 gap-2">
            {PRIORITIES.map((p) => {
              const selected = priority === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setPriority(p.name)}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                    selected
                      ? `${p.border ?? 'border-teal-500'} ${p.bg} ${p.text} shadow-glow`
                      : 'border-navy-100 bg-white text-navy-600 hover:border-navy-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Assigned team */}
        <div>
          <label className="block text-sm font-bold text-navy-700 mb-2">
            Assign Maintenance Team
            {assignedTeam !== 'Unassigned' && (
              <span className="ml-2 text-xs font-normal text-teal-600">Currently: {assignedTeam}</span>
            )}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MAINTENANCE_TEAMS.map((team) => {
              const selected = assignedTeam === team;
              return (
                <button
                  key={team}
                  type="button"
                  onClick={() => setAssignedTeam(team)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all ${
                    selected
                      ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-glow'
                      : team === 'Unassigned'
                      ? 'border-navy-100 bg-navy-50 text-navy-400 hover:border-navy-200'
                      : 'border-navy-100 bg-white text-navy-600 hover:border-navy-200'
                  }`}
                >
                  <Wrench className={`w-3.5 h-3.5 ${selected ? 'text-teal-600' : 'text-navy-400'}`} />
                  {team}
                </button>
              );
            })}
          </div>
        </div>

        {/* Resolution notes */}
        <div>
          <label className="block text-sm font-bold text-navy-700 mb-2">
            Resolution Notes
            {status === 'Resolved' && <span className="text-red-500 ml-0.5">*</span>}
          </label>
          <textarea
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Describe what was done to resolve this issue..."
            rows={3}
            className="input-field resize-none"
          />
          {status === 'Resolved' && !resolutionNotes.trim() && (
            <p className="text-xs text-navy-400 mt-1">
              Resolution notes are required when marking an issue as Resolved.
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-scale-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button className="btn-ghost flex-1" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary flex-[2]" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
