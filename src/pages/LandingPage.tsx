import { useEffect } from 'react';
import { Logo } from '@/components/Logo';
import { CategoryIcon } from '@/components/CategoryIcon';
import { useApp } from '@/store';
import {
  ArrowRight,
  ClipboardList,
  ShieldCheck,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock3,
  Wrench,
  Search,
  Bell,
} from 'lucide-react';
import type { IssueCategory } from '@/types';
import { CATEGORIES } from '@/data';

export function LandingPage() {
  const { setView, issues, loading, error, reloadIssues } = useApp();

  useEffect(() => {
    void reloadIssues();
  }, [reloadIssues]);

  const stats = {
    total: issues.length,
    resolved: issues.filter((i) => i.status === 'Resolved').length,
    inProgress: issues.filter((i) => i.status === 'In Progress').length,
    pending: issues.filter((i) => i.status === 'Reported').length,
  };

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-1">
            <a href="#how" className="nav-link">How it works</a>
            <a href="#categories" className="nav-link">Categories</a>
            <a href="#stats" className="nav-link">Stats</a>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost text-sm hidden sm:inline-flex" onClick={() => setView('student')}>
              Student Login
            </button>
            <button className="btn-primary text-sm" onClick={() => setView('admin')}>
              Admin Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-radial-fade">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Live campus issue tracking
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 tracking-tight text-balance leading-[1.1]">
                A better campus starts with{' '}
                <span className="text-teal-600">one report.</span>
              </h1>
              <p className="mt-6 text-lg text-navy-600 max-w-xl leading-relaxed">
                Fixora lets students report broken taps, flickering lights, slow
                WiFi and safety hazards in seconds — and track every issue from
                report to resolution.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="btn-primary text-base px-6 py-3" onClick={() => setView('report')}>
                  <ClipboardList className="w-5 h-5" />
                  Report an Issue
                </button>
                <button className="btn-secondary text-base px-6 py-3" onClick={() => setView('student')}>
                  Student Login
                </button>
                <button className="btn-ghost text-base px-6 py-3" onClick={() => setView('admin')}>
                  <ShieldCheck className="w-5 h-5" />
                  Admin Login
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-navy-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  No sign-up to report
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  Real-time tracking
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="card p-6 shadow-card-hover">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-teal-600" />
                    </div>
                    <span className="text-sm font-bold text-navy-900">Campus Overview</span>
                  </div>
                  <span className="badge bg-teal-50 text-teal-700">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="Total Reports" value={stats.total} icon={ClipboardList} color="text-navy-700" bg="bg-navy-50" />
                  <MiniStat label="Pending" value={stats.pending} icon={Clock3} color="text-amber-700" bg="bg-amber-50" />
                  <MiniStat label="In Progress" value={stats.inProgress} icon={Wrench} color="text-teal-700" bg="bg-teal-50" />
                  <MiniStat label="Resolved" value={stats.resolved} icon={CheckCircle2} color="text-emerald-700" bg="bg-emerald-50" />
                </div>
                <div className="mt-4 pt-4 border-t border-navy-100">
                  <p className="text-xs font-semibold text-navy-500 mb-2">Recent Reports</p>
                  <div className="space-y-2">
                    {loading && issues.length === 0 ? (
                      <p className="text-xs text-navy-400 py-3">Loading live reports...</p>
                    ) : error ? (
                      <div className="flex items-center justify-between gap-2 py-2">
                        <p className="text-xs text-red-600 truncate">Live data unavailable</p>
                        <button className="text-xs font-semibold text-teal-700" onClick={() => void reloadIssues()}>Retry</button>
                      </div>
                    ) : issues.length === 0 ? (
                      <p className="text-xs text-navy-400 py-3">No reports have been submitted yet.</p>
                    ) : issues.slice(0, 3).map((issue) => (
                      <div key={issue.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-navy-50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center shrink-0">
                          <CategoryIcon category={issue.category as IssueCategory} className="w-4 h-4 text-navy-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-navy-800 truncate">{issue.title}</p>
                          <p className="text-xs text-navy-400">{issue.location}</p>
                        </div>
                        <span className={`badge ${issue.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' : issue.status === 'In Progress' ? 'bg-teal-50 text-teal-700' : 'bg-navy-100 text-navy-700'}`}>
                          {issue.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating accent */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 opacity-20 blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 bg-white border-y border-navy-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-navy-900">How Fixora works</h2>
            <p className="mt-3 text-navy-600">Three simple steps from spotting a problem to seeing it fixed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <StepCard
              step="01"
              icon={ClipboardList}
              title="Report an issue"
              description="Snap a photo, pick a category, and describe what's broken. It takes less than a minute."
            />
            <StepCard
              step="02"
              icon={Search}
              title="Track progress"
              description="Every report gets a unique ID. Watch it move from Reported to In Progress to Resolved."
            />
            <StepCard
              step="03"
              icon={CheckCircle2}
              title="Get notified"
              description="Admins assign maintenance teams, add resolution notes, and close the loop — you see it all."
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-navy-900">What can you report?</h2>
            <p className="mt-3 text-navy-600">From leaky taps to slow WiFi — if it affects campus life, report it.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="card card-hover p-5 text-center group">
                <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <CategoryIcon category={cat.name as IssueCategory} className={`w-6 h-6 ${cat.text}`} />
                </div>
                <p className="text-sm font-bold text-navy-800">{cat.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-20 bg-navy-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold">Built for the whole campus</h2>
            <p className="mt-3 text-navy-200">Real numbers from our preview dataset.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <BigStat value={stats.total} label="Issues reported" icon={ClipboardList} />
            <BigStat value={stats.pending} label="Awaiting action" icon={Clock3} />
            <BigStat value={stats.inProgress} label="Being fixed now" icon={Wrench} />
            <BigStat value={stats.resolved} label="Resolved" icon={CheckCircle2} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-50 border border-navy-100 text-navy-600 text-xs font-semibold mb-6">
            <Bell className="w-3.5 h-3.5" />
            Ready to make campus better?
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 text-balance">
            See something broken? Report it in 60 seconds.
          </h2>
          <p className="mt-4 text-lg text-navy-600">
            No account needed to file a report. Log in as a student to track your
            submissions, or as an admin to manage everything.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button className="btn-primary text-base px-6 py-3" onClick={() => setView('report')}>
              <ClipboardList className="w-5 h-5" />
              Report an Issue
            </button>
            <button className="btn-secondary text-base px-6 py-3" onClick={() => setView('student')}>
              <Users className="w-5 h-5" />
              Go to Student Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-navy-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-navy-400">
            Fixora — Live campus issue reporting and resolution tracking.
          </p>
        </div>
      </footer>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  icon: typeof ClipboardList;
  color: string;
  bg: string;
}) {
  return (
    <div className="rounded-xl border border-navy-100 p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <span className="text-xs font-medium text-navy-500">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-navy-900">{value}</p>
    </div>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: string;
  icon: typeof ClipboardList;
  title: string;
  description: string;
}) {
  return (
    <div className="card card-hover p-6 relative">
      <div className="absolute top-4 right-4 text-4xl font-extrabold text-navy-100 select-none">{step}</div>
      <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-teal-600" />
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-2">{title}</h3>
      <p className="text-sm text-navy-600 leading-relaxed">{description}</p>
    </div>
  );
}

function BigStat({
  value,
  label,
  icon: Icon,
}: {
  value: number;
  label: string;
  icon: typeof ClipboardList;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-teal-400" />
      </div>
      <p className="text-4xl font-extrabold text-white">{value}</p>
      <p className="text-sm text-navy-300 mt-1">{label}</p>
    </div>
  );
}
