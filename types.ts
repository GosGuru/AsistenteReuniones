export type OutputFormat = 'json' | 'markdown';
export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

export interface Decision {
  decision: string;
  who: string;
  when?: string;
  rationale?: string;
}

export interface Risk {
  risk: string;
  impact: string;
  mitigation?: string;
}

export interface Summary {
  executive_summary: string;
  key_points: string[];
  decisions: Decision[];
  risks: Risk[];
}

export interface Project {
  name: string;
  status: string;
  owner: string;
  notes?: string;
}

export interface Idea {
  idea: string;
  value?: string;
  effort?: string;
  next_step?: string;
}

export interface NotionSave {
  page: string;
  url?: string;
  note?: string;
}

export interface TechnicalConsideration {
  topic: string;
  details: string;
  open_questions: string[];
}

export interface Task {
  task: string;
  owner: string;
  due?: string;
  priority: 'alta' | 'media' | 'baja';
  dependencies: string[];
}

export interface SummaryData {
  summary: Summary;
  projects_current: Project[];
  new_ideas_opportunities: Idea[];
  saved_to_notion: NotionSave[];
  technical_considerations: TechnicalConsideration[];
  next_steps: Task[];
  notes: string;
  transcript: string;
}