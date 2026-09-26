import { supabase, ADMIN_KEY } from './supabase';
import type { Issue, IssueCategory, IssuePriority, IssueStatus, MaintenanceTeam, TimelineEvent } from '../types';

export interface IssueRow {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  priority: IssuePriority;
  status: IssueStatus;
  photo_url: string | null;
  reported_by: string;
  assigned_team: MaintenanceTeam;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineRow {
  id: number;
  issue_id: string;
  status: IssueStatus;
  note: string | null;
  actor: string;
  created_at: string;
}

function rowToTimeline(r: TimelineRow): TimelineEvent {
  return {
    status: r.status,
    timestamp: r.created_at,
    note: r.note ?? undefined,
    actor: r.actor,
  };
}

function rowToIssue(issue: IssueRow, timeline: TimelineEvent[]): Issue {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    location: issue.location,
    priority: issue.priority,
    status: issue.status,
    photoUrl: issue.photo_url ?? undefined,
    reportedBy: issue.reported_by,
    reportedAt: issue.created_at,
    updatedAt: issue.updated_at,
    assignedTeam: issue.assigned_team,
    resolutionNotes: issue.resolution_notes ?? undefined,
    timeline,
  };
}

export async function fetchAllIssues(): Promise<Issue[]> {
  // Load the main issue table first. A timeline permission/configuration problem
  // should not make the entire dashboard appear empty.
  const { data: issues, error: issuesError } = await supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false });

  if (issuesError) throw new Error(`Could not load issues: ${issuesError.message}`);

  const { data: timeline, error: timelineError } = await supabase
    .from('issue_timeline')
    .select('*')
    .order('created_at', { ascending: true });

  if (timelineError) {
    console.warn('Fixora: issue timeline could not be loaded:', timelineError.message);
  }

  const issueRows = (issues ?? []) as IssueRow[];
  const timelineRows = (timeline ?? []) as TimelineRow[];

  return issueRows.map((row) => {
    const events = timelineRows.filter((t) => t.issue_id === row.id).map(rowToTimeline);
    return rowToIssue(row, events);
  });
}

export async function fetchIssueById(id: string): Promise<Issue | null> {
  const { data: issue, error: issueError } = await supabase
    .from('issues')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (issueError) throw new Error(issueError.message);
  if (!issue) return null;

  const { data: timeline, error: timelineError } = await supabase
    .from('issue_timeline')
    .select('*')
    .eq('issue_id', id)
    .order('created_at', { ascending: true });

  if (timelineError) throw new Error(timelineError.message);

  return rowToIssue(issue as IssueRow, (timeline ?? []).map(rowToTimeline));
}

export interface NewIssueInput {
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  priority: IssuePriority;
  photoUrl?: string;
  reportedBy: string;
}

export async function createIssue(input: NewIssueInput): Promise<Issue> {
  const { data: idResult, error: idError } = await supabase.rpc('generate_issue_id');
  if (idError) throw new Error(`Failed to generate issue ID: ${idError.message}`);

  const issueId = idResult as string;
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from('issues').insert({
    id: issueId,
    title: input.title,
    description: input.description,
    category: input.category,
    location: input.location,
    priority: input.priority,
    status: 'Reported',
    photo_url: input.photoUrl ?? null,
    reported_by: input.reportedBy,
    assigned_team: 'Unassigned',
    resolution_notes: null,
  });

  if (insertError) throw new Error(insertError.message);

  const { error: timelineError } = await supabase.from('issue_timeline').insert({
    issue_id: issueId,
    status: 'Reported',
    note: null,
    actor: input.reportedBy,
  });

  if (timelineError) throw new Error(timelineError.message);

  const created = await fetchIssueById(issueId);
  if (!created) throw new Error('Issue was created but could not be retrieved');
  return created;
}

export interface AdminUpdateInput {
  status?: IssueStatus;
  priority?: IssuePriority;
  assignedTeam?: MaintenanceTeam;
  resolutionNotes?: string;
}

export async function adminUpdateIssue(
  issueId: string,
  currentIssue: Issue,
  input: AdminUpdateInput
): Promise<void> {
  const { data: result, error } = await supabase.rpc('update_issue_admin', {
    p_admin_key: ADMIN_KEY,
    p_issue_id: issueId,
    p_status: input.status ?? null,
    p_priority: input.priority ?? null,
    p_assigned_team: input.assignedTeam ?? null,
    p_resolution_notes: input.resolutionNotes ?? null,
  });

  if (error) throw new Error(error.message);

  const resultObj = result as { success: boolean; error?: string };
  if (!resultObj?.success) throw new Error(resultObj?.error ?? 'Failed to update issue');
}
