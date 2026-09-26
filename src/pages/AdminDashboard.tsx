import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/store';
import { TopNav } from '@/components/TopNav';
import { StatCard, EmptyState } from '@/components/StatCard';
import { IssueCard } from '@/components/IssueCard';
import { IssueDetailModal } from '@/components/IssueDetailModal';
import { AdminIssuePanel } from '@/components/AdminIssuePanel';
import { CATEGORIES, PRIORITIES, STATUSES, MAINTENANCE_TEAMS, getCategoryMeta, getPriorityMeta, getStatusMeta } from '@/data';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { Issue, IssueCategory, IssuePriority, IssueStatus, MaintenanceTeam } from '@/types';
import {
  ClipboardList,
  Clock3,
  Wrench,
  CheckCircle2,
  Search,
  X,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Inbox,
  LayoutGrid,
  List,
} from 'lucide-react';

export function AdminDashboard() {
  const { issues, loading, error, reloadIssues, updateIssue, selectedIssueId, setSelectedIssueId } = useApp();

  useEffect(() => {
    void reloadIssues();
  }, [reloadIssues]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'All'>('All');
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority | 'All'>('All');
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [layout, setLayout] = useState<'grid' | 'table'>('table');
  const [manageId, setManageId] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      total: issues.length,
      pending: issues.filter((i) => i.status === 'Reported').length,
      inProgress: issues.filter((i) => i.status === 'In Progress').length,
      resolved: issues.filter((i) => i.status === 'Resolved').length,
      urgent: issues.filter((i) => i.priority === 'Urgent' && i.status !== 'Resolved').length,
    }),
    [issues]
  );

  const locations = useMemo(() => {
    return Array.from(new Set(issues.map((i) => i.location))).sort();
  }, [issues]);

  const filtered = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        !search ||
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.id.toLowerCase().includes(search.toLowerCase()) ||
        issue.reportedBy.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || issue.status === statusFilter;
      const matchesCategory = categoryFilter === 'All' || issue.category === categoryFilter;
      const matchesPriority = priorityFilter === 'All' || issue.priority === priorityFilter;
      const matchesLocation = locationFilter === 'All' || issue.location === locationFilter;
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesLocation;
    });
  }, [issues, search, statusFilter, categoryFilter, priorityFilter, locationFilter]);

  const categoryStats = useMemo(() => {
    const map = new Map<IssueCategory, number>();
    issues.forEach((i) => map.set(i.category, (map.get(i.category) ?? 0) + 1));
    return CATEGORIES.map((c) => ({ ...c, count: map.get(c.name) ?? 0 }));
  }, [issues]);

  const statusStats = useMemo(() => {
    return STATUSES.map((s) => ({
      ...s,
      count: issues.filter((i) => i.status === s.name).length,
    }));
  }, [issues]);

  const priorityStats = useMemo(() => {
    return PRIORITIES.map((p) => ({
      ...p,
      count: issues.filter((i) => i.priority === p.name).length,
    }));
  }, [issues]);

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) ?? null;
  const manageIssue = issues.find((i) => i.id === manageId) ?? null;

  const hasFilters = search || statusFilter !== 'All' || categoryFilter !== 'All' || priorityFilter !== 'All' || locationFilter !== 'All';

  function clearFilters() {
    setSearch('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setPriorityFilter('All');
    setLocationFilter('All');
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <TopNav activeView="admin" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-navy-900">Admin Dashboard</h1>
              <span className="badge bg-teal-50 text-teal-700">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-sm text-navy-500 mt-1">
              Manage all reported campus issues, assign teams, and track resolution.
            </p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-navy-100">
            <button
              onClick={() => setLayout('table')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                layout === 'table' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'
              }`}
            >
              <List className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setLayout('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                layout === 'grid' ? 'bg-white text-navy-900 shadow-sm' : 'text-navy-500'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
          </div>
        </div>

        {error && (
          <div className="card p-4 mb-6 border-red-200 bg-red-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-red-800">Could not load reports</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button className="btn-danger shrink-0" onClick={() => void reloadIssues()}>Try again</button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Total Reports" value={stats.total} icon={ClipboardList} accent="text-navy-900" iconBg="bg-navy-100 text-navy-700" />
          <StatCard label="Pending" value={stats.pending} icon={Clock3} accent="text-amber-700" iconBg="bg-amber-50 text-amber-600" />
          <StatCard label="In Progress" value={stats.inProgress} icon={Wrench} accent="text-teal-700" iconBg="bg-teal-50 text-teal-600" />
          <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} accent="text-emerald-700" iconBg="bg-emerald-50 text-emerald-600" />
          <StatCard label="Urgent Open" value={stats.urgent} icon={TrendingUp} accent="text-red-700" iconBg="bg-red-50 text-red-600" />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-4 mb-8">
          {/* Status breakdown */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-4 h-4 text-navy-500" />
              <h3 className="section-title">Status Breakdown</h3>
            </div>
            <div className="space-y-3">
              {statusStats.map((s) => {
                const pct = stats.total > 0 ? (s.count / stats.total) * 100 : 0;
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 text-navy-600">
                        <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                        {s.name}
                      </span>
                      <span className="font-bold text-navy-900">{s.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.dot} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-navy-500" />
              <h3 className="section-title">Issues by Category</h3>
            </div>
            <div className="space-y-2.5">
              {categoryStats.map((c) => {
                const pct = stats.total > 0 ? (c.count / stats.total) * 100 : 0;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center shrink-0`}>
                      <CategoryIcon category={c.name} className={`w-3.5 h-3.5 ${c.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-navy-600 font-medium">{c.name}</span>
                        <span className="font-bold text-navy-900">{c.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
                        <div className="h-full rounded-full bg-teal-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority breakdown */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-navy-500" />
              <h3 className="section-title">Priority Distribution</h3>
            </div>
            <div className="flex items-end justify-between h-32 gap-3 px-2">
              {priorityStats.map((p) => {
                const max = Math.max(...priorityStats.map((x) => x.count), 1);
                const h = (p.count / max) * 100;
                return (
                  <div key={p.name} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-sm font-extrabold text-navy-900">{p.count}</span>
                    <div className="w-full rounded-t-lg flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t-lg ${p.dot} transition-all duration-700`}
                        style={{ height: `${h}%`, minHeight: '4px' }}
                      />
                    </div>
                    <span className="text-xs text-navy-500 font-medium">{p.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search by title, ID, or reporter name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field pl-10"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="btn-ghost text-sm whitespace-nowrap">
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-navy-500">
                <Filter className="w-3.5 h-3.5" />
                Filters:
              </span>
              <FilterSelect label="Status" value={statusFilter} onChange={(v) => setStatusFilter(v as IssueStatus | 'All')} options={['All', ...STATUSES.map((s) => s.name)]} />
              <FilterSelect label="Category" value={categoryFilter} onChange={(v) => setCategoryFilter(v as IssueCategory | 'All')} options={['All', ...CATEGORIES.map((c) => c.name)]} />
              <FilterSelect label="Priority" value={priorityFilter} onChange={(v) => setPriorityFilter(v as IssuePriority | 'All')} options={['All', ...PRIORITIES.map((p) => p.name)]} />
              <FilterSelect label="Location" value={locationFilter} onChange={(v) => setLocationFilter(v)} options={['All', ...locations]} />
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-navy-500">
            Showing <span className="font-bold text-navy-900">{filtered.length}</span> of {issues.length} issues
          </p>
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
              title="No issues match your filters"
              description="Try clearing some filters to see more results."
              action={
                <button className="btn-ghost" onClick={clearFilters}>
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              }
            />
          </div>
        ) : layout === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onClick={() => setSelectedIssueId(issue.id)} />
            ))}
          </div>
        ) : (
          <AdminTable issues={filtered} onView={setSelectedIssueId} onManage={setManageId} />
        )}
      </div>

      <IssueDetailModal issue={selectedIssue} onClose={() => setSelectedIssueId(null)} />
      {manageIssue && (
        <AdminIssuePanel
          issue={manageIssue}
          onClose={() => setManageId(null)}
          onUpdate={async (patch) => {
            await updateIssue(manageIssue.id, patch);
            setManageId(null);
          }}
        />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-medium text-navy-400">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-navy-200 bg-white text-navy-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function AdminTable({
  issues,
  onView,
  onManage,
}: {
  issues: Issue[];
  onView: (id: string) => void;
  onManage: (id: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy-50 text-navy-500 text-xs uppercase tracking-wide">
              <th className="text-left font-bold px-4 py-3">ID</th>
              <th className="text-left font-bold px-4 py-3">Title</th>
              <th className="text-left font-bold px-4 py-3 hidden md:table-cell">Category</th>
              <th className="text-left font-bold px-4 py-3 hidden lg:table-cell">Location</th>
              <th className="text-left font-bold px-4 py-3">Priority</th>
              <th className="text-left font-bold px-4 py-3">Status</th>
              <th className="text-left font-bold px-4 py-3 hidden xl:table-cell">Team</th>
              <th className="text-right font-bold px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-100">
            {issues.map((issue) => {
              const catMeta = getCategoryMeta(issue.category);
              const priMeta = getPriorityMeta(issue.priority);
              const stMeta = getStatusMeta(issue.status);
              return (
                <tr key={issue.id} className="hover:bg-navy-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-navy-400">{issue.id}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <button onClick={() => onView(issue.id)} className="text-left">
                      <span className="font-semibold text-navy-900 hover:text-teal-700 line-clamp-1">{issue.title}</span>
                      <span className="text-xs text-navy-400 block">{issue.reportedBy}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`badge ${catMeta.bg} ${catMeta.text}`}>
                      <CategoryIcon category={issue.category} className="w-3 h-3" />
                      {issue.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-navy-600">{issue.location}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${priMeta.bg} ${priMeta.text}`}>
                      <span className={`w-2 h-2 rounded-full ${priMeta.dot}`} />
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${stMeta.bg} ${stMeta.text}`}>
                      <span className={`w-2 h-2 rounded-full ${stMeta.dot} ${issue.status !== 'Resolved' ? 'animate-pulse' : ''}`} />
                      {issue.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-navy-600 text-xs">{issue.assignedTeam}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onView(issue.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-navy-600 hover:bg-navy-100 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onManage(issue.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
