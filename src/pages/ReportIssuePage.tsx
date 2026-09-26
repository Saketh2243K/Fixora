import { useState, type FormEvent } from 'react';
import { useApp } from '@/store';
import { TopNav } from '@/components/TopNav';
import { CategoryIcon } from '@/components/CategoryIcon';
import { CATEGORIES, BUILDINGS } from '@/data';
import type { Issue, IssueCategory, IssuePriority } from '@/types';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  MapPin,
  Send,
  FileText,
} from 'lucide-react';

const PRIORITIES: { name: IssuePriority; bg: string; text: string; border: string; dot: string }[] = [
  { name: 'Low', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  { name: 'Medium', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  { name: 'High', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  { name: 'Urgent', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
];

interface FormState {
  title: string;
  description: string;
  category: IssueCategory | '';
  location: string;
  priority: IssuePriority;
  photoUrl: string;
}

const EMPTY: FormState = {
  title: '',
  description: '',
  category: '',
  location: '',
  priority: 'Medium',
  photoUrl: '',
};

export function ReportIssuePage() {
  const { setView, addIssue, studentName } = useApp();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitted, setSubmitted] = useState<Issue | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) e.title = 'Please enter a title for the issue.';
    else if (form.title.trim().length < 5) e.title = 'Title must be at least 5 characters.';
    if (!form.description.trim()) e.description = 'Please describe the issue.';
    else if (form.description.trim().length < 15) e.description = 'Description must be at least 15 characters.';
    if (!form.category) e.category = 'Please select a category.';
    if (!form.location) e.location = 'Please select a building or location.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const created = await addIssue({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category as IssueCategory,
        location: form.location,
        priority: form.priority,
        photoUrl: form.photoUrl || undefined,
        reportedBy: studentName,
      });
      setSubmitted(created);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photoUrl: reader.result as string }));
    reader.readAsDataURL(file);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-navy-50">
        <TopNav activeView="report" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card p-8 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-navy-900">Issue reported successfully!</h2>
            <p className="text-navy-600 mt-2">
              Your report has been submitted and is now visible to the maintenance team.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-50 border border-navy-100">
              <span className="text-sm text-navy-500">Your tracking ID:</span>
              <span className="font-mono font-bold text-teal-700">{submitted.id}</span>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-navy-50 text-left">
              <p className="text-sm font-bold text-navy-800">{submitted.title}</p>
              <p className="text-xs text-navy-500 mt-1">{submitted.location} · {submitted.category}</p>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button className="btn-primary" onClick={() => setView('student')}>
                View My Reports
              </button>
              <button
                className="btn-ghost"
                onClick={() => { setForm(EMPTY); setSubmitted(null); }}
              >
                Report Another
              </button>
            </div>
            <p className="text-xs text-navy-400 mt-4">
              Your report is saved to the Fixora database and can be tracked from My Reports.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <TopNav activeView="report" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button className="btn-ghost text-sm mb-4" onClick={() => setView('student')}>
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-navy-900">Report an Issue</h1>
          <p className="text-sm text-navy-500 mt-1">
            Fill in the details below. The more specific you are, the faster the team can fix it.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
          {/* Title */}
          <Field label="Issue Title" error={errors.title} required>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Leaking tap in second-floor restroom"
              className="input-field"
              maxLength={100}
            />
            <div className="text-xs text-navy-400 mt-1 text-right">{form.title.length}/100</div>
          </Field>

          {/* Description */}
          <Field label="Description" error={errors.description} required>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Describe the issue in detail — when did it start, how severe is it, any safety risks?"
              rows={4}
              className="input-field resize-none"
              maxLength={500}
            />
            <div className="text-xs text-navy-400 mt-1 text-right">{form.description.length}/500</div>
          </Field>

          {/* Category */}
          <Field label="Category" error={errors.category} required>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CATEGORIES.map((cat) => {
                const selected = form.category === cat.name;
                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: cat.name }))}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-teal-500 bg-teal-50 shadow-glow'
                        : 'border-navy-100 bg-white hover:border-navy-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${cat.bg} flex items-center justify-center`}>
                      <CategoryIcon category={cat.name} className={`w-5 h-5 ${cat.text}`} />
                    </div>
                    <span className={`text-xs font-semibold ${selected ? 'text-teal-700' : 'text-navy-600'}`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Location */}
          <Field label="Building / Location" error={errors.location} required>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400 pointer-events-none" />
              <select
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="input-field pl-10 appearance-none cursor-pointer"
              >
                <option value="">Select a location...</option>
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </Field>

          {/* Priority */}
          <Field label="Priority Level" required>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRIORITIES.map((p) => {
                const selected = form.priority === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, priority: p.name }))}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      selected
                        ? `${p.border} ${p.bg} shadow-glow`
                        : 'border-navy-100 bg-white hover:border-navy-200'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${p.dot}`} />
                    <span className={`text-sm font-semibold ${selected ? p.text : 'text-navy-600'}`}>
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Photo */}
          <Field label="Photo (optional)">
            {form.photoUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-navy-100">
                <img src={form.photoUrl} alt="Preview" className="w-full max-h-56 object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, photoUrl: '' }))}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-navy-900/80 text-white flex items-center justify-center hover:bg-navy-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-navy-200 hover:border-teal-400 hover:bg-teal-50/30 cursor-pointer transition-colors">
                <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-navy-400" />
                </div>
                <span className="text-sm font-medium text-navy-600">Click to upload a photo</span>
                <span className="text-xs text-navy-400">PNG, JPG up to 5MB</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </Field>

          {/* Error banner */}
          {Object.keys(errors).length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-scale-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Please fix the highlighted fields and try again.
            </div>
          )}

          {submitError && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm animate-scale-in">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button type="button" className="btn-ghost sm:flex-1" onClick={() => setView('student')}>
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary sm:flex-[2]">
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>

        <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-navy-100/60 text-xs text-navy-500">
          <FileText className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong className="text-navy-700">Connected:</strong> Submitted reports are saved to the Fixora
            database and can be tracked from My Reports.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-navy-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600 mt-1.5 animate-scale-in">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}
