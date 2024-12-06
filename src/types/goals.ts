import { AssessmentResult, ChangeSignificance } from './index';

export enum GoalCategory {
  ADL = 'Activities of Daily Living',
  IADL = 'Instrumental Activities of Daily Living',
  MOBILITY = 'Mobility',
  COGNITION = 'Cognitive Function',
  SOCIAL = 'Social Participation',
  WORK = 'Work/Productivity',
  EDUCATION = 'Education',
  LEISURE = 'Leisure'
}

export enum GoalStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  ACHIEVED = 'Achieved',
  MODIFIED = 'Modified',
  DISCONTINUED = 'Discontinued'
}

export interface GoalMeasurement {
  date: Date;
  value: number;
  notes?: string;
  linked_assessment?: AssessmentResult;
}

export interface TherapeuticGoal {
  id: string;
  category: GoalCategory;
  description: string;
  baseline: GoalMeasurement;
  target: {
    value: number;
    target_date: Date;
  };
  measurements: GoalMeasurement[];
  status: GoalStatus;
  created_date: Date;
  modified_date: Date;
  progress_indicators: {
    measurement_type: string;
    unit: string;
    frequency: string;
  };
  barriers: string[];
  facilitators: string[];
  intervention_strategies: string[];
}

export interface GoalProgress {
  goal: TherapeuticGoal;
  current_value: number;
  percent_complete: number;
  trending: ChangeSignificance;
  days_remaining: number;
  projected_completion_date?: Date;
}