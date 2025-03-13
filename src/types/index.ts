// Basic task item structure
export interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  codeSnippet?: string;
  implementation?: string;
  createdAt: string;
  updatedAt?: string;
}

// Filter options for task list
export type FilterType = 'all' | 'active' | 'completed';

// Sort options for task list
export type SortType = 'asc' | 'desc';

// View modes for the application
export type ViewMode = 'list' | 'kanban' | 'timeline';