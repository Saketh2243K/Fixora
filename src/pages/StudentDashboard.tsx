import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/store';
import { TopNav } from '@/components/TopNav';
import { StatCard, EmptyState } from '@/components/StatCard';
import { IssueCard } from '@/components/IssueCard';
import { IssueDetailModal } from '@/components/IssueDetailModal';
import {
  ClipboardList,
  Clock3,
  Wrench,
  CheckCircle2,
  Plus,
  Search,
  Inbox,
  Filter,
  X,
} from 'lucide-react';
import type { IssueStatus } from '@/types';

const STATUS_FILTERS: (IssueStatus | 'All')[] = ['All', 'Reported', 'In Progress', 'Resolved'];

export function StudentDashboard() {
  const { issues, loading, error, reloadIssues, setView, selectedIssueId, setSelectedIssueId } = useApp();

  useEffect(() => {
    void reloadIssues();
  }, [reloadIssues]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'All'>('All');

  const myIssues = useMemo(() => {
    // For preview, show all sample issues as "my issues"
    return issues;
  }, [issues]);

  const stats = useMemo(
    () => ({
      total: myIssues.length,
      pending: myIssues.filter((i) => i.status === 'Reported').length,
      inProgress: myIssues.filter((i) => i.status === 'In Progress').length,
      resolved: myIssues.filter((i) => i.status === 'Resolved').length,
    }),
    [myIssues]
  );

  const filtered = useMemo(() => {
    return myIssues.filter((issue) => {
      const matchesSearch =
        !search ||
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.id.toLowerCase().includes(search.toLowerCase()) ||
        issue.location.toLowerCase().includes(search.toLowerCase()) ||
        issue.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [myIssues, search, statusFilter]);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) ?? null;

  return (
    <div className="min-h-screen bg-navy-50">
      <TopNav activeView="student" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-navy-900">My Reports</h1>
            <p className="text-sm text-navy-500 mt-1">
              Track every issue you've submitted and its resolution status.
            </p>
          </div>
          <button className="btn-primary" onClick={() => setView('report')}>
            <Plus className="w-4 h-4" />
            Report New Issue
          </button>
        </div>

        {error && (
          <div className="card p-4 mb-6 border-red-200 bg-red-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-red-800">Could not load reports</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button className="btn-danger shrink-0" onClick={() => void reloadIssues()}>
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Reports" value={stats.total} icon={ClipboardList} accent="text-navy-900" iconBg="bg-navy-100 text-navy-700" />
          <StatCard label="Pending" value={stats.pending} icon={Clock3} accent="text-amber-700" iconBg="bg-amber-50 text-amber-600" />
          <StatCard label="In Progress" value={stats.inProgress} icon={Wrench} accent="text-teal-700" iconBg="bg-teal-50 text-teal-600" />
          <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} accent="text-emerald-700" iconBg="bg-emerald-50 text-emerald-600" />
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                placeholder="Search by title, ID, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="flex items-center gap-1 text-xs font-semibold text-navy-500 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                Status:
              </span>
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    statusFilter === s
                      ? 'bg-navy-900 text-white'
                      : 'bg-navy-50 text-navy-600 hover:bg-navy-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Issue list */}
        {loading && issues.length === 0 ? (
          <div className="card p-10 text-center">
            <div className="mx-auto w-10 h-10 rounded-full border-4 border-navy-200 border-t-teal-600 animate-spin" />
            <p className="mt-4 text-sm font-semibold text-navy-600">Loading reports...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={Inbox}
              title="No issues found"
              description={search || statusFilter !== 'All'
                ? "Try adjusting your search or filters to see more results."
                : "You haven't reported any issues yet. Click below to file your first report."}
              action={
                !search && statusFilter === 'All' ? (
                  <button className="btn-primary" onClick={() => setView('report')}>
                    <Plus className="w-4 h-4" />
                    Report New Issue
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onClick={() => setSelectedIssueId(issue.id)} />
            ))}
          </div>
        )}
      </div>

      <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssueId(null)} />
    </div>
  );
}
