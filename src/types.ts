export type IssueCategory =
  | 'Plumbing'
  | 'Electrical'
  | 'Furniture'
  | 'Cleanliness'
  | 'Internet'
  | 'Safety'
  | 'Other';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type IssueStatus = 'Reported' | 'In Progress' | 'Resolved';

export type MaintenanceTeam =
  | 'Facilities Team'
  | 'Electrical Team'
  | 'Plumbing Team'
  | 'IT Support'
  | 'Housekeeping'
  | 'Security Team'
  | 'Unassigned';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  priority: IssuePriority;
  status: IssueStatus;
  photoUrl?: string;
  reportedBy: string;
  reportedAt: string;
  updatedAt: string;
  assignedTeam: MaintenanceTeam;
  resolutionNotes?: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  status: IssueStatus;
  timestamp: string;
  note?: string;
  actor: string;
}

export type ViewName = 'landing' | 'student' | 'report' | 'admin';

export interface CategoryMeta {
  name: IssueCategory;
  icon: string;
  color: string;
  bg: string;
  text: string;
}

export interface PriorityMeta {
  name: IssuePriority;
  color: string;
  bg: string;
  text: string;
  dot: string;
  border: string;
}

export interface StatusMeta {
  name: IssueStatus;
  color: string;
  bg: string;
  text: string;
  dot: string;
  border: string;
}
