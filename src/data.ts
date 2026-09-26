import type {
  CategoryMeta,
  Issue,
  IssueCategory,
  IssuePriority,
  IssueStatus,
  PriorityMeta,
  StatusMeta,
  MaintenanceTeam,
} from './types';

export const CATEGORIES: CategoryMeta[] = [
  { name: 'Plumbing', icon: 'Droplets', color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700' },
  { name: 'Electrical', icon: 'Zap', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700' },
  { name: 'Furniture', icon: 'Armchair', color: 'orange', bg: 'bg-orange-50', text: 'text-orange-700' },
  { name: 'Cleanliness', icon: 'Sparkles', color: 'teal', bg: 'bg-teal-50', text: 'text-teal-700' },
  { name: 'Internet', icon: 'Wifi', color: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  { name: 'Safety', icon: 'ShieldAlert', color: 'red', bg: 'bg-red-50', text: 'text-red-700' },
  { name: 'Other', icon: 'PackageOpen', color: 'navy', bg: 'bg-navy-100', text: 'text-navy-700' },
];

export const PRIORITIES: PriorityMeta[] = [
  { name: 'Low', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-400' },
  { name: 'Medium', color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-400' },
  { name: 'High', color: 'orange', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500', border: 'border-orange-400' },
  { name: 'Urgent', color: 'red', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-400' },
];

export const STATUSES: StatusMeta[] = [
  { name: 'Reported', color: 'navy', bg: 'bg-navy-100', text: 'text-navy-700', dot: 'bg-navy-500', border: 'border-navy-400' },
  { name: 'In Progress', color: 'teal', bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-400' },
  { name: 'Resolved', color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-400' },
];

export const MAINTENANCE_TEAMS: MaintenanceTeam[] = [
  'Unassigned',
  'Facilities Team',
  'Electrical Team',
  'Plumbing Team',
  'IT Support',
  'Housekeeping',
  'Security Team',
];

export const BUILDINGS = [
  'Engineering Block',
  'Mechanical Block',
  'Electrical Block',
  'Electronics Block',
  'Civil Block',
  'Computer Science Block',
  'Chemistry Lab',
  'Physics Lab',
  'Library',
  'Girls Hostel',
  'Boys Hostel',
  'Admin Building',
  'Cafeteria',
  'Sports Complex',
  'Auditorium',
  'Computer Lab',
];

export function getCategoryMeta(name: IssueCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function getPriorityMeta(name: IssuePriority): PriorityMeta {
  return PRIORITIES.find((p) => p.name === name) ?? PRIORITIES[0];
}

export function getStatusMeta(name: IssueStatus): StatusMeta {
  return STATUSES.find((s) => s.name === name) ?? STATUSES[0];
}

export const SAMPLE_ISSUES: Issue[] = [
  {
    id: 'CF-2026-001',
    title: 'Leaking tap in second-floor restroom',
    description:
      'The tap near the second washbasin in the Engineering Block A second-floor restroom has been continuously leaking for three days. Water is pooling on the floor and creating a slip hazard.',
    category: 'Plumbing',
    location: 'Engineering Block A',
    priority: 'High',
    status: 'In Progress',
    reportedBy: 'Student of NIE',
    reportedAt: '2026-09-20T09:15:00Z',
    updatedAt: '2026-09-22T11:30:00Z',
    assignedTeam: 'Plumbing Team',
    timeline: [
      { status: 'Reported', timestamp: '2026-09-20T09:15:00Z', actor: 'Student of NIE' },
      {
        status: 'In Progress',
        timestamp: '2026-09-22T11:30:00Z',
        actor: 'Admin',
        note: 'Plumbing team dispatched. Awaiting replacement part.',
      },
    ],
  },
  {
    id: 'CF-2026-002',
    title: 'Flickering lights in Computer Lab',
    description:
      'Multiple ceiling lights in the Computer Lab are flickering rapidly, causing eye strain for students working on projects. This has been happening for over a week.',
    category: 'Electrical',
    location: 'Computer Lab',
    priority: 'Medium',
    status: 'Reported',
    reportedBy: 'Priya Nair',
    reportedAt: '2026-09-23T14:20:00Z',
    updatedAt: '2026-09-23T14:20:00Z',
    assignedTeam: 'Unassigned',
    timeline: [
      { status: 'Reported', timestamp: '2026-09-23T14:20:00Z', actor: 'Priya Nair' },
    ],
  },
  {
    id: 'CF-2026-003',
    title: 'Broken chair in Library reading hall',
    description:
      'A chair in the Library 2nd Floor reading hall has a broken leg. It wobbles dangerously when someone sits on it. There is a risk of injury.',
    category: 'Furniture',
    location: 'Library - 2nd Floor',
    priority: 'Low',
    status: 'Resolved',
    reportedBy: 'Rohan Verma',
    reportedAt: '2026-09-15T10:00:00Z',
    updatedAt: '2026-09-18T16:45:00Z',
    assignedTeam: 'Facilities Team',
    resolutionNotes: 'Chair replaced with a new unit from storage. Old chair scrapped.',
    timeline: [
      { status: 'Reported', timestamp: '2026-09-15T10:00:00Z', actor: 'Rohan Verma' },
      {
        status: 'In Progress',
        timestamp: '2026-09-17T09:00:00Z',
        actor: 'Admin',
        note: 'Facilities team notified. Replacement chair identified in storage.',
      },
      {
        status: 'Resolved',
        timestamp: '2026-09-18T16:45:00Z',
        actor: 'Admin',
        note: 'Chair replaced with a new unit from storage. Old chair scrapped.',
      },
    ],
  },
  {
    id: 'CF-2026-004',
    title: 'Slow WiFi in Hostel Block C',
    description:
      'WiFi connectivity in Hostel Block C has been extremely slow for the past week, especially during evening hours. Students are unable to attend online classes or submit assignments.',
    category: 'Internet',
    location: 'Hostel Block C',
    priority: 'Urgent',
    status: 'In Progress',
    reportedBy: 'Sneha Reddy',
    reportedAt: '2026-09-24T20:30:00Z',
    updatedAt: '2026-09-25T08:00:00Z',
    assignedTeam: 'IT Support',
    timeline: [
      { status: 'Reported', timestamp: '2026-09-24T20:30:00Z', actor: 'Sneha Reddy' },
      {
        status: 'In Progress',
        timestamp: '2026-09-25T08:00:00Z',
        actor: 'Admin',
        note: 'IT Support investigating router capacity. Bandwidth upgrade under review.',
      },
    ],
  },
  {
    id: 'CF-2026-005',
    title: 'Spillage near Cafeteria kitchen exit',
    description:
      'There is a persistent liquid spillage near the Cafeteria kitchen exit door. The area smells and is attracting insects. Needs immediate cleaning.',
    category: 'Cleanliness',
    location: 'Cafeteria',
    priority: 'High',
    status: 'Reported',
    reportedBy: 'Karan Mehta',
    reportedAt: '2026-09-25T12:10:00Z',
    updatedAt: '2026-09-25T12:10:00Z',
    assignedTeam: 'Unassigned',
    timeline: [
      { status: 'Reported', timestamp: '2026-09-25T12:10:00Z', actor: 'Karan Mehta' },
    ],
  },
  {
    id: 'CF-2026-006',
    title: 'Damaged handrail on Science Block B staircase',
    description:
      'The metal handrail on the second-flight staircase in Science Block B is loose and has sharp exposed edges. This is a serious safety risk for students using the stairs.',
    category: 'Safety',
    location: 'Science Block B',
    priority: 'Urgent',
    status: 'Resolved',
    reportedBy: 'Ananya Iyer',
    reportedAt: '2026-09-10T08:45:00Z',
    updatedAt: '2026-09-14T15:20:00Z',
    assignedTeam: 'Facilities Team',
    resolutionNotes: 'Handrail re-welded and reinforced. Sharp edges filed down and painted.',
    timeline: [
      { status: 'Reported', timestamp: '2026-09-10T08:45:00Z', actor: 'Ananya Iyer' },
      {
        status: 'In Progress',
        timestamp: '2026-09-11T10:00:00Z',
        actor: 'Admin',
        note: 'Facilities team dispatched for emergency repair.',
      },
      {
        status: 'Resolved',
        timestamp: '2026-09-14T15:20:00Z',
        actor: 'Admin',
        note: 'Handrail re-welded and reinforced. Sharp edges filed down and painted.',
      },
    ],
  },
  {
    id: 'CF-2026-007',
    title: 'Air conditioner not cooling in Auditorium',
    description:
      'The main AC unit in the Auditorium is running but not producing cold air. During the recent seminar, the hall became uncomfortably warm.',
    category: 'Electrical',
    location: 'Auditorium',
    priority: 'Medium',
    status: 'Reported',
    reportedBy: 'Vikram Singh',
    reportedAt: '2026-09-26T07:30:00Z',
    updatedAt: '2026-09-26T07:30:00Z',
    assignedTeam: 'Unassigned',
    timeline: [
      { status: 'Reported', timestamp: '2026-09-26T07:30:00Z', actor: 'Vikram Singh' },
    ],
  },
  {
    id: 'CF-2026-008',
    title: 'Broken window latch in Hostel Block D room 204',
    description:
      'The window latch in Hostel Block D room 204 is broken, so the window cannot be secured. This is a security concern during nights.',
    category: 'Safety',
    location: 'Hostel Block D',
    priority: 'High',
    status: 'In Progress',
    reportedBy: 'Diya Patel',
    reportedAt: '2026-09-22T18:00:00Z',
    updatedAt: '2026-09-24T09:15:00Z',
    assignedTeam: 'Security Team',
    timeline: [
      { status: 'Reported', timestamp: '2026-09-22T18:00:00Z', actor: 'Diya Patel' },
      {
        status: 'In Progress',
        timestamp: '2026-09-24T09:15:00Z',
        actor: 'Admin',
        note: 'Security team assessing. Temporary lock installed pending latch replacement.',
      },
    ],
  },
];
