import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Issue, ViewName } from './types';
import {
  fetchAllIssues,
  createIssue as dbCreateIssue,
  adminUpdateIssue as dbAdminUpdate,
  type NewIssueInput,
  type AdminUpdateInput,
} from './lib/database';

interface AppContextValue {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  reloadIssues: () => Promise<void>;
  addIssue: (input: NewIssueInput) => Promise<Issue>;
  updateIssue: (id: string, input: AdminUpdateInput) => Promise<void>;
  view: ViewName;
  setView: (view: ViewName) => void;
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  studentName: string;
  setStudentName: (name: string) => void;
  isAdmin: boolean;
  setIsAdmin: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ViewName>('landing');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('Student of NIE');
  const [isAdmin, setIsAdmin] = useState(false);

  const reloadIssues = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllIssues();
      setIssues(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load issues';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addIssue = useCallback(async (input: NewIssueInput): Promise<Issue> => {
    setError(null);
    try {
      const created = await dbCreateIssue(input);
      setIssues((prev) => [created, ...prev.filter((issue) => issue.id !== created.id)]);
      return created;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create issue';
      setError(message);
      throw err;
    }
  }, []);

  const updateIssue = useCallback(async (id: string, input: AdminUpdateInput): Promise<void> => {
    const current = issues.find((i) => i.id === id);
    if (!current) throw new Error('Issue not found');

    setError(null);
    await dbAdminUpdate(id, current, input);
    await reloadIssues();
  }, [issues, reloadIssues]);

  return (
    <AppContext.Provider
      value={{
        issues,
        loading,
        error,
        reloadIssues,
        addIssue,
        updateIssue,
        view,
        setView,
        selectedIssueId,
        setSelectedIssueId,
        studentName,
        setStudentName,
        isAdmin,
        setIsAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
